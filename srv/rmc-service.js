'use strict';

const cds = require('@sap/cds');
const { decimal } = require('./lib/calculation-engine');
const { toConfig } = require('./lib/configuration');
const { DemoPostingAdapter, stableHash } = require('./lib/demo-posting-adapter');

const LOG = cds.log('rmc-service');

function actor(req) {
  return req.user?.id || 'system';
}

function assertVersion(req, record, expectedVersion) {
  if (!record) req.reject(404, 'The requested business object does not exist.');
  if (expectedVersion === undefined || expectedVersion === null) {
    req.reject(428, 'expectedVersion is required to prevent overwriting a concurrent change.');
  }
  if (Number(record.version) !== Number(expectedVersion)) {
    req.reject(409, `This object changed after it was loaded. Expected version ${expectedVersion}; current version is ${record.version}.`);
  }
}

module.exports = class RmcService extends cds.ApplicationService {
  async init() {
    const entities = cds.entities('rmc');
    const postingAdapter = new DemoPostingAdapter();

    this.before('CREATE', 'PriceChangeRequests', (req) => {
      const data = req.data;
      data.ID ||= cds.utils.uuid();
      data.requestNumber ||= `PCR-${new Date().getUTCFullYear()}-${data.ID.slice(0, 8).toUpperCase()}`;
      data.status = 'DRAFT';
      data.version = 1;
      if (data.proposedPrice !== undefined && decimal(data.proposedPrice).lte(0)) {
        req.reject(400, 'Proposed price must be greater than zero.');
      }
      if (data.priceUnit !== undefined && Number(data.priceUnit) <= 0) {
        req.reject(400, 'Price unit must be greater than zero.');
      }
      if (data.validFrom && data.validTo && data.validTo < data.validFrom) {
        req.reject(400, 'Valid-to date cannot be before valid-from date.');
      }
    });

    this.before('UPDATE', 'PriceChangeRequests', async (req) => {
      const protectedFields = [
        'status', 'version', 'submittedAt', 'submittedBy', 'decidedAt', 'decidedBy', 'decisionComment'
      ];
      if (protectedFields.some((field) => Object.prototype.hasOwnProperty.call(req.data, field))) {
        req.reject(400, 'Workflow-controlled fields can be changed only through submit and decision actions.');
      }
      const ID = req.data.ID || req.params?.[0]?.ID;
      const current = ID && await cds.tx(req).run(
        SELECT.one.from(entities.PriceChangeRequests).where({ ID })
      );
      if (!current) req.reject(404, 'Price change request not found.');
      if (!['DRAFT', 'REJECTED'].includes(current.status)) {
        req.reject(409, `A ${current.status} request cannot be edited.`);
      }
      if (req.data.proposedPrice !== undefined && decimal(req.data.proposedPrice).lte(0)) {
        req.reject(400, 'Proposed price must be greater than zero.');
      }
      req.data.version = Number(current.version) + 1;
    });

    this.before('DELETE', 'PriceChangeRequests', (req) => {
      req.reject(405, 'Price change requests are retained for audit and cannot be deleted.');
    });

    this.on('getDashboard', async (req) => {
      const tx = cds.tx(req);
      const [priceGroups, runGroups, exposure] = await Promise.all([
        tx.run(SELECT.from(entities.PriceChangeRequests).columns('status', 'count(*) as count').groupBy('status')),
        tx.run(SELECT.from(entities.CalculationRuns).columns('status', 'count(*) as count').groupBy('status')),
        tx.run(
          SELECT.from(entities.CalculationRuns)
            .columns('currency', 'sum(totalAmount) as amount')
            .where({ status: { in: ['COMPLETED', 'APPROVED'] } })
            .groupBy('currency')
        )
      ]);
      const priceCount = Object.fromEntries(priceGroups.map((row) => [row.status, Number(row.count)]));
      const runCount = Object.fromEntries(runGroups.map((row) => [row.status, Number(row.count)]));
      const primaryExposure = exposure[0] || { amount: 0, currency: '' };
      return {
        draftPriceChanges: priceCount.DRAFT || 0,
        pendingApprovals: (priceCount.SUBMITTED || 0) + (priceCount.UNDER_REVIEW || 0),
        queuedRuns: runCount.QUEUED || 0,
        runningRuns: runCount.RUNNING || 0,
        completedRuns: runCount.COMPLETED || 0,
        failedRuns: runCount.FAILED || 0,
        approvedNotPosted: runCount.APPROVED || 0,
        totalExposure: primaryExposure.amount || 0,
        currency: exposure.length === 0 ? '' : (exposure.length === 1 ? primaryExposure.currency : 'MULTI'),
        demoMode: process.env.RMC_DEMO_MODE !== 'false'
      };
    });

    this.on('submitPriceChange', async (req) => {
      const { priceChangeID, expectedVersion } = req.data;
      const tx = cds.tx(req);
      const record = await tx.run(SELECT.one.from(entities.PriceChangeRequests).where({ ID: priceChangeID }));
      assertVersion(req, record, expectedVersion);
      if (!['DRAFT', 'REJECTED'].includes(record.status)) req.reject(409, `A ${record.status} request cannot be submitted.`);
      if (decimal(record.proposedPrice).lte(0)) req.reject(400, 'Proposed price must be greater than zero.');

      const now = new Date().toISOString();
      const changed = await tx.run(
        UPDATE(entities.PriceChangeRequests)
          .set({
            status: 'SUBMITTED',
            submittedAt: now,
            submittedBy: actor(req),
            decidedAt: null,
            decidedBy: null,
            decisionComment: null,
            version: Number(record.version) + 1
          })
          .where({ ID: priceChangeID, version: Number(expectedVersion) })
      );
      if (!changed) req.reject(409, 'The request was changed by another user. Reload and try again.');
      await this.#audit(tx, entities, req, 'PRICE_CHANGE', priceChangeID, Number(record.version) + 1, 'SUBMITTED', null, 'RmcEditor');
      return tx.run(SELECT.one.from(entities.PriceChangeRequests).where({ ID: priceChangeID }));
    });

    this.on('decidePriceChange', async (req) => {
      const { priceChangeID, expectedVersion, decision, comment } = req.data;
      const normalizedDecision = String(decision || '').toUpperCase();
      if (!['APPROVE', 'REJECT'].includes(normalizedDecision)) req.reject(400, 'Decision must be APPROVE or REJECT.');
      if (normalizedDecision === 'REJECT' && !comment) req.reject(400, 'A rejection comment is required.');

      const tx = cds.tx(req);
      const record = await tx.run(SELECT.one.from(entities.PriceChangeRequests).where({ ID: priceChangeID }));
      assertVersion(req, record, expectedVersion);
      if (!['SUBMITTED', 'UNDER_REVIEW'].includes(record.status)) req.reject(409, `A ${record.status} request cannot be decided.`);

      const settings = toConfig(await tx.run(SELECT.from(entities.AppSettings)));
      const allowSelfApproval = Boolean(settings.ALLOW_SELF_APPROVAL_DEMO) && process.env.RMC_DEMO_MODE !== 'false';
      if (!allowSelfApproval && record.submittedBy === actor(req)) {
        req.reject(403, 'Maker-checker control prevents the submitter from approving this request.');
      }
      const requiredRole = await this.#requiredApprovalRole(tx, entities, req, 'PRICE_CHANGE');

      const status = normalizedDecision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      const changed = await tx.run(
        UPDATE(entities.PriceChangeRequests)
          .set({
            status,
            decidedAt: new Date().toISOString(),
            decidedBy: actor(req),
            decisionComment: comment || null,
            version: Number(record.version) + 1
          })
          .where({ ID: priceChangeID, version: Number(expectedVersion) })
      );
      if (!changed) req.reject(409, 'The request was changed by another user. Reload and try again.');
      await this.#audit(tx, entities, req, 'PRICE_CHANGE', priceChangeID, Number(record.version) + 1, status, comment, requiredRole);
      return tx.run(SELECT.one.from(entities.PriceChangeRequests).where({ ID: priceChangeID }));
    });

    this.on('queueCalculation', async (req) => {
      const { priceChangeID, periodFrom, periodTo, priority = 100 } = req.data;
      if (!periodFrom || !periodTo || periodTo < periodFrom) req.reject(400, 'A valid calculation period is required.');
      const tx = cds.tx(req);
      const priceChange = await tx.run(SELECT.one.from(entities.PriceChangeRequests).where({ ID: priceChangeID }));
      if (!priceChange) req.reject(404, 'Price change request not found.');
      if (priceChange.status !== 'APPROVED') req.reject(409, 'Only an approved price change can be calculated.');
      if (periodFrom < priceChange.validFrom || (priceChange.validTo && periodTo > priceChange.validTo)) {
        req.reject(400, 'The calculation period must be inside the approved price-change validity period.');
      }

      const duplicate = await tx.run(
        SELECT.one.from(entities.CalculationRuns).where({
          priceChange_ID: priceChangeID,
          periodFrom,
          periodTo,
          status: { in: ['QUEUED', 'RUNNING', 'COMPLETED', 'APPROVED', 'POSTED'] }
        })
      );
      if (duplicate) req.reject(409, `Calculation ${duplicate.runNumber} already covers this request and period.`);

      const settings = await tx.run(SELECT.from(entities.AppSettings));
      const ID = cds.utils.uuid();
      const now = new Date();
      const runNumber = `CAL-${now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)}-${ID.slice(0, 6).toUpperCase()}`;
      await tx.run(
        INSERT.into(entities.CalculationRuns).entries({
          ID,
          runNumber,
          priceChange_ID: priceChangeID,
          periodFrom,
          periodTo,
          cutoffAt: now.toISOString(),
          status: 'QUEUED',
          priority: Math.max(1, Math.min(999, Number(priority || 100))),
          requestedBy: actor(req),
          currency: priceChange.currency,
          configSnapshot: JSON.stringify(toConfig(settings)),
          version: 1
        })
      );
      await this.#event(tx, entities, 'INFO', 'CALCULATION', req, 'CALCULATION_RUN', ID, `${runNumber} was queued.`);
      return tx.run(SELECT.one.from(entities.CalculationRuns).where({ ID }));
    });

    this.on('decideCalculation', async (req) => {
      const { runID, expectedVersion, decision, comment } = req.data;
      const normalizedDecision = String(decision || '').toUpperCase();
      if (!['APPROVE', 'REJECT'].includes(normalizedDecision)) req.reject(400, 'Decision must be APPROVE or REJECT.');
      if (normalizedDecision === 'REJECT' && !comment) req.reject(400, 'A rejection comment is required.');
      const tx = cds.tx(req);
      const run = await tx.run(SELECT.one.from(entities.CalculationRuns).where({ ID: runID }));
      assertVersion(req, run, expectedVersion);
      if (run.status !== 'COMPLETED') req.reject(409, `A ${run.status} calculation cannot be decided.`);
      if (Number(run.exceptionCount) > 0 && normalizedDecision === 'APPROVE') {
        req.reject(409, 'Resolve or formally exclude all calculation exceptions before approval.');
      }
      const requiredRole = await this.#requiredApprovalRole(tx, entities, req, 'CALCULATION_RUN');
      const status = normalizedDecision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      const changed = await tx.run(
        UPDATE(entities.CalculationRuns)
          .set({ status, version: Number(run.version) + 1 })
          .where({ ID: runID, version: Number(expectedVersion) })
      );
      if (!changed) req.reject(409, 'The calculation changed after it was loaded.');
      await this.#audit(tx, entities, req, 'CALCULATION_RUN', runID, Number(run.version) + 1, status, comment, requiredRole);
      return tx.run(SELECT.one.from(entities.CalculationRuns).where({ ID: runID }));
    });

    this.on('simulatePosting', async (req) => {
      const { runID } = req.data;
      const tx = cds.tx(req);
      const run = await tx.run(SELECT.one.from(entities.CalculationRuns).where({ ID: runID }));
      if (!run) req.reject(404, 'Calculation run not found.');
      if (run.status !== 'APPROVED') req.reject(409, 'Only an approved calculation can be simulated for posting.');

      const result = await postingAdapter.simulate({ run, user: actor(req) });
      const existing = await tx.run(
        SELECT.one.from(entities.PostingRecords).where({ idempotencyKey: result.idempotencyKey })
      );
      if (existing) return existing;

      const ID = cds.utils.uuid();
      await tx.run(INSERT.into(entities.PostingRecords).entries({ ID, objectType: 'CALCULATION_RUN', objectID: runID, ...result }));
      await this.#event(tx, entities, 'INFO', 'POSTING', req, 'CALCULATION_RUN', runID, result.message);
      return tx.run(SELECT.one.from(entities.PostingRecords).where({ ID }));
    });

    this.on('createContractProposal', async (req) => {
      const { runID, contractItemID, validFrom } = req.data;
      const tx = cds.tx(req);
      const [run, item] = await Promise.all([
        tx.run(SELECT.one.from(entities.CalculationRuns).where({ ID: runID })),
        tx.run(SELECT.one.from(entities.ContractItems).where({ ID: contractItemID }))
      ]);
      if (!run || !item) req.reject(404, 'Calculation run or contract item not found.');
      if (!['COMPLETED', 'APPROVED'].includes(run.status)) req.reject(409, 'The calculation is not ready for a contract proposal.');
      if (decimal(run.totalEligibleQty).isZero()) req.reject(409, 'Cannot derive a unit-price change from zero eligible quantity.');

      const unitDelta = decimal(run.totalAmount).div(run.totalEligibleQty);
      const proposedPrice = decimal(item.currentPrice).plus(unitDelta).toDecimalPlaces(6).toString();
      const ID = cds.utils.uuid();
      const proposalNumber = `CPP-${run.runNumber.replace('CAL-', '')}-${ID.slice(0, 4).toUpperCase()}`;
      await tx.run(
        INSERT.into(entities.ContractPriceProposals).entries({
          ID,
          proposalNumber,
          run_ID: runID,
          contractItem_ID: contractItemID,
          oldPrice: item.currentPrice,
          proposedPrice,
          currency: run.currency,
          priceUnit: item.priceUnit,
          validFrom,
          status: 'DRAFT',
          version: 1
        })
      );
      return tx.run(SELECT.one.from(entities.ContractPriceProposals).where({ ID }));
    });

    await super.init();
  }

  async #requiredApprovalRole(tx, entities, req, objectType) {
    const policy = await tx.run(
      SELECT.one.from(entities.ApprovalPolicies)
        .where({ objectType, active: true })
        .orderBy('sequence asc')
    );
    if (!policy) req.reject(409, `No active approval policy is configured for ${objectType}.`);
    const demoMode = process.env.RMC_DEMO_MODE !== 'false';
    if (!demoMode && !req.user.is(policy.requiredRole)) {
      req.reject(403, `Role ${policy.requiredRole} is required by the active approval policy.`);
    }
    return policy.requiredRole;
  }

  async #audit(tx, entities, req, objectType, objectID, objectVersion, decision, comment, actorRole) {
    await tx.run(
      INSERT.into(entities.ApprovalRecords).entries({
        ID: cds.utils.uuid(),
        objectType,
        objectID,
        objectVersion,
        step: 1,
        decision,
        actor: actor(req),
        actorRole: actorRole || 'DEMO_USER',
        comment: comment || null,
        decidedAt: new Date().toISOString()
      })
    );
  }

  async #event(tx, entities, severity, category, req, objectType, objectID, message) {
    await tx.run(
      INSERT.into(entities.SystemEvents).entries({
        ID: cds.utils.uuid(),
        occurredAt: new Date().toISOString(),
        severity,
        category,
        correlationId: req.headers?.['x-correlation-id'] || stableHash({ objectID, at: Date.now() }).slice(0, 20),
        objectType,
        objectID,
        message
      })
    );
    LOG.info(message);
  }
};
