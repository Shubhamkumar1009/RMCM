'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { DemoPostingAdapter } = require('../srv/lib/demo-posting-adapter');

test('creates deterministic simulated posting and immutable reversal evidence', async () => {
  const adapter = new DemoPostingAdapter();
  const run = { ID: 'RUN-1', version: 3, runNumber: 'CAL-1', totalAmount: '4200', currency: 'INR' };
  const posting = { ID: 'POST-1', ...(await adapter.simulate({ run, user: 'buyer' })) };
  const reversal = await adapter.reverseSimulation({ posting, user: 'finance', reason: 'Corrected source data' });
  assert.equal(reversal.status, 'REVERSED');
  assert.equal(reversal.simulated, true);
  assert.equal(reversal.reversalOf, posting.ID);
  assert.match(reversal.sapDocument, /^REV-SIM-/);
  assert.match(reversal.message, /No S\/4HANA call/);
  const replay = await adapter.reverseSimulation({ posting, user: 'finance', reason: 'Corrected source data' });
  assert.equal(replay.idempotencyKey, reversal.idempotencyKey);
});
