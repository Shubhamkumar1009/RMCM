'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateImpactLine, sum } = require('../srv/lib/calculation-engine');

test('calculates a positive retrospective price impact with decimal precision', () => {
  const result = calculateImpactLine({
    goodsReceipt: { quantity: '100' },
    constituent: { contentQuantity: '1.5', yieldFactor: '1', scrapFactor: '1' },
    oldPrice: '60',
    newPrice: '70',
    priceUnit: 1,
    quantitySign: 1,
    roundingScale: 2
  });

  assert.equal(result.eligibleQuantity, '100');
  assert.equal(result.normalizedRmContent, '1.5');
  assert.equal(result.priceDelta, '10');
  assert.equal(result.amount, '1500');
});

test('applies reversal signs and price units', () => {
  const result = calculateImpactLine({
    goodsReceipt: { quantity: '20' },
    constituent: { contentQuantity: '1.5', yieldFactor: '1', scrapFactor: '1' },
    oldPrice: '6000',
    newPrice: '7000',
    priceUnit: 100,
    quantitySign: -1,
    roundingScale: 2
  });

  assert.equal(result.amount, '-300');
});

test('sums amounts without binary floating-point drift', () => {
  assert.equal(sum(['0.1', '0.2'], 2), '0.3');
});
