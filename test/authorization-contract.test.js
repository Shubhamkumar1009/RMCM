'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const cds = require('@sap/cds');

test('declares persona gates on all new mutation and reconciliation actions', async () => {
  const model = await cds.load(['db', 'srv']);
  const expected = {
    createVendorPartLinkage: 'Buyer',
    searchValidContractItems: 'Buyer',
    allocateContract: 'Buyer',
    createCompositionRevision: 'Buyer',
    mapCompositionLeaf: 'Buyer',
    submitComposition: 'Buyer',
    decideContractException: 'CompositionApprover',
    decideComposition: 'CompositionApprover',
    resolveWorkflowException: 'CompositionApprover',
    reconcilePriceChange: 'RmcAuditor',
    submitRmMasterRequest: 'Buyer',
    decideRmMasterRequest: 'RmAdmin',
    submitPriceChange: 'Buyer',
    decidePriceChange: 'RmcApprover',
    releasePriceDocument: 'Buyer',
    decidePriceDocument: 'CompositionApprover',
    queueCalculation: 'Buyer',
    rerunCalculation: 'Buyer',
    decideCalculation: 'RmcApprover',
    simulatePosting: 'RmcFinance',
    reverseSimulatedPosting: 'RmcFinance'
  };
  for (const [action, role] of Object.entries(expected)) {
    assert.equal(model.definitions[`RmcService.${action}`]?.['@requires'], role, `${action} must require ${role}`);
  }
});

test('declares matching XSUAA scopes and role templates', () => {
  const security = require('../xs-security.json');
  const scopes = new Set(security.scopes.map((scope) => scope.name));
  const templates = new Set(security['role-templates'].map((role) => role.name));
  for (const role of ['Buyer', 'CompositionApprover', 'RmcAuditor', 'RmAdmin', 'RmcApprover']) {
    assert.ok(scopes.has(`$XSAPPNAME.${role}`), `missing ${role} scope`);
    assert.ok(templates.has(role), `missing ${role} role template`);
  }
});
