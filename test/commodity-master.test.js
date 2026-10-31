'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeCommodityDraft, assertValidity, lifecycleStatus } = require('../srv/lib/commodity-master');

test('normalizes and validates a commodity draft', () => {
  assert.deepEqual(normalizeCommodityDraft({
    code: ' precious_metals ',
    name: ' Precious Metals ',
    description: ' Governed catalog entry ',
    validFrom: '2026-11-01',
    validTo: '2027-12-31'
  }), {
    code: 'PRECIOUS_METALS',
    name: 'Precious Metals',
    description: 'Governed catalog entry',
    validFrom: '2026-11-01',
    validTo: '2027-12-31'
  });
});

test('rejects invalid commodity validity and resolves lifecycle state', () => {
  assert.throws(() => assertValidity('2026-11-01', '2026-10-31'), /cannot precede/);
  assert.equal(lifecycleStatus('2026-10-27', false, '2026-10-28'), 'INACTIVE');
  assert.equal(lifecycleStatus('2026-12-31', false, '2026-10-28'), 'ACTIVE');
  assert.equal(lifecycleStatus('2026-12-31', true, '2026-10-28'), 'BLOCKED');
});
