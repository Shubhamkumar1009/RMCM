'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const cds = require('@sap/cds');

test('models legacy-critical VPL, amendment and engineering fields', async () => {
  const model = await cds.load(['db', 'srv']);
  const linkage = model.definitions['rmc.VendorPartLinkages'];
  const constituent = model.definitions['rmc.PartConstituents'];
  const priceChange = model.definitions['rmc.PriceChangeRequests'];

  for (const field of ['linkageType', 'partType', 'indexingFrequency', 'initialSettledRate', 'preliminaryExposure', 'sourceReference']) {
    assert.ok(linkage.elements[field], `missing VendorPartLinkages.${field}`);
  }
  for (const field of ['minimumThickness', 'maximumThickness', 'offcutWeight', 'offcutPct', 'surfaceArea', 'surfaceProtectionCost', 'boughtOutCost', 'packagingTermsCost', 'impactModifier']) {
    assert.ok(constituent.elements[field], `missing PartConstituents.${field}`);
  }
  for (const field of ['inputMode', 'enteredDelta', 'secondAmendmentDate', 'thirdAmendmentDate', 'attachmentReference']) {
    assert.ok(priceChange.elements[field], `missing PriceChangeRequests.${field}`);
  }
  assert.equal(model.definitions['RmcService.createPriceChange']['@requires'], 'Buyer');
  assert.ok(model.definitions['RmcService.getLegacyControlMatrix']);
});

test('declares source-line and calculation-line duplicate prevention', async () => {
  const model = await cds.load(['db', 'srv']);
  assert.ok(model.definitions['rmc.GoodsReceipts']['@assert.unique.sourceDocumentLine']);
  assert.ok(model.definitions['rmc.CalculationLines']['@assert.unique.runReceiptConstituent']);
});
