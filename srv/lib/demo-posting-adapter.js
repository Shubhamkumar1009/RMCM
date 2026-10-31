'use strict';

const crypto = require('node:crypto');

function stableHash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

class DemoPostingAdapter {
  async simulate({ run, user }) {
    const hash = stableHash({ run: run.ID, version: run.version, amount: run.totalAmount, currency: run.currency });
    return {
      idempotencyKey: stableHash({ type: 'RMC_REVALUATION', run: run.ID, version: run.version }),
      requestHash: hash,
      postingType: 'MRNB_EQUIVALENT_DEMO',
      status: 'SIMULATED',
      simulated: true,
      sapDocument: `SIM-${run.runNumber}`.slice(0, 30),
      sapFiscalYear: String(new Date().getUTCFullYear()),
      postedAt: new Date().toISOString(),
      message: `Demo simulation by ${user}; no S/4HANA call was made.`
    };
  }

  async reverseSimulation({ posting, user, reason }) {
    return {
      idempotencyKey: stableHash({ type: 'RMC_REVALUATION_REVERSAL', posting: posting.ID }),
      requestHash: stableHash({ posting: posting.ID, requestHash: posting.requestHash, reason }),
      postingType: 'MRNB_EQUIVALENT_DEMO_REVERSAL',
      status: 'REVERSED',
      simulated: true,
      sapDocument: `REV-${posting.sapDocument || posting.ID}`.slice(0, 30),
      sapFiscalYear: posting.sapFiscalYear,
      postedAt: new Date().toISOString(),
      message: `Demo reversal by ${user}: ${reason}. No S/4HANA call was made.`,
      reversalOf: posting.ID
    };
  }
}

module.exports = { DemoPostingAdapter, stableHash };
