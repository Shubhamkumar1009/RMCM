'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPricingWorkbench } = require('../srv/lib/pricing-workbench');

test('builds an explainable current-versus-proposed component cost sheet', () => {
  const result = buildPricingWorkbench({
    priceChange: {
      requestNumber: 'PCR-1', supplier_ID: 'S1', grade_ID: 'G1', oldPrice: '60', proposedPrice: '70',
      priceUnit: 1, currency: 'INR', validFrom: '2026-09-01', validTo: '2026-09-30', status: 'APPROVED'
    },
    supplier: { code: 'V1', name: 'Supplier', companyCode: '1000', purchasingOrg: 'P100' },
    profile: { ID: 'P1' },
    material: { code: 'PART-100', description: 'Part', plant: '1000' },
    contractItem: { itemNumber: '00010', currentPrice: '2250' },
    contract: { contractNumber: '4600001000', companyCode: '1000', purchasingOrg: 'P100', purchasingGroup: '001' },
    constituents: [
      { grade_ID: 'G1', bomItem_ID: 'B1', contentQuantity: '1.5', yieldFactor: '1', scrapFactor: '1', contentUoM: 'KG' },
      { grade_ID: 'G2', bomItem_ID: 'B2', contentQuantity: '0.5', yieldFactor: '1', scrapFactor: '1', contentUoM: 'KG' }
    ],
    grades: [{ ID: 'G1', code: 'STEEL', name: 'Steel' }, { ID: 'G2', code: 'AL', name: 'Aluminium' }],
    bomItems: [{ ID: 'B1', componentScrapPct: '0' }, { ID: 'B2', componentScrapPct: '0' }],
    vendorPrices: [{ grade_ID: 'G2', price: '220', priceUnit: 1, validFrom: '2026-01-01', validTo: '2026-12-31' }],
    eligibleQuantity: '280'
  });

  assert.equal(result.summary.unitDelta, '15');
  assert.equal(result.summary.currentPoPrice, '2250');
  assert.equal(result.summary.revisedPoPrice, '2265');
  assert.equal(result.summary.estimatedImpact, '4200');
  assert.equal(result.lines[0].explanation, '1.5 KG x (70 - 60) / 1');
  assert.deepEqual(result.breakdown.map((row) => row.proposedValue), ['215', '2050', '2265']);
});
