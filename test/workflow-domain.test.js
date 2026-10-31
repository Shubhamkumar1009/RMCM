'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { explodeBom, assessComposition, isInOrganizationalScope } = require('../srv/lib/workflow-domain');

test('explodes a multi-level BOM and identifies leaf mappings', () => {
  const nodes = explodeBom({
    rootMaterialID: 'ROOT', plant: '1000', keyDate: '2026-10-28',
    materials: [
      { ID: 'ROOT', code: 'ROOT', description: 'Root' },
      { ID: 'MID', code: 'MID', description: 'Intermediate' },
      { ID: 'LEAF', code: 'LEAF', description: 'Leaf' }
    ],
    headers: [
      { ID: 'H1', material_ID: 'ROOT', plant: '1000', validFrom: '2026-01-01', validTo: '2026-12-31' },
      { ID: 'H2', material_ID: 'MID', plant: '1000', validFrom: '2026-01-01', validTo: '2026-12-31' }
    ],
    items: [
      { ID: 'I1', header_ID: 'H1', component_ID: 'MID', itemNumber: '0010', componentQuantity: '2', componentUoM: 'EA' },
      { ID: 'I2', header_ID: 'H2', component_ID: 'LEAF', itemNumber: '0010', componentQuantity: '3', componentUoM: 'KG' }
    ]
  });
  assert.equal(nodes.length, 2);
  assert.equal(nodes[1].lineagePath, 'ROOT/MID/LEAF');
  assert.equal(nodes[1].quantity, '6');
  assert.equal(nodes[1].leafPart, true);
});

test('blocks incomplete composition and enforces organizational attributes', () => {
  const assessment = assessComposition([
    { bomItemID: 'I1', lineagePath: 'ROOT/LEAF', leafPart: true }
  ], []);
  assert.equal(assessment.completenessPct, '0.00');
  assert.equal(assessment.findings[0].code, 'UNMAPPED_LEAF');
  assert.equal(isInOrganizationalScope({ attr: { plant: ['1000'], purchasingOrg: 'P100', supplier: '*' } }, {
    plant: '1000', purchasingOrg: 'P100', supplierCode: 'V1'
  }), true);
  assert.equal(isInOrganizationalScope({ attr: { plant: ['2000'] } }, { plant: '1000' }), false);
});

test('creates an advisory finding for a documented manual leaf override', () => {
  const assessment = assessComposition([
    { bomItemID: 'I1', lineagePath: 'ROOT/LEAF', leafPart: true }
  ], [{
    bomItem_ID: 'I1', grade_ID: 'G1', contentUoM: 'KG', inputWeight: '1.1', outputWeight: '1', scrapWeight: '0.1', source: 'MANUAL'
  }]);
  assert.equal(assessment.completenessPct, '100.00');
  assert.deepEqual(assessment.findings.map((finding) => finding.code), ['MANUAL_OVERRIDE']);
  assert.equal(assessment.findings[0].mandatory, false);
});
