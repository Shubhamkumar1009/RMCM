'use strict';

const cds = require('@sap/cds');
const { calculateImpactLine, decimal } = require('./calculation-engine');
const { toConfig } = require('./configuration');

const LOG = cds.log('rmc-worker');

class CalculationWorker {
  constructor({ workerId }) {
    this.workerId = workerId;
    this.running = false;
  }

  async poll() {
    if (this.running) return;
    this.running = true;
    try {
      const db = await cds.connect.to('db');
      const entities = cds.entities('rmc');
      const candidate = await db.run(
        SELECT.one.from(entities.CalculationRuns)
          .where({ status: 'QUEUED' })
          .orderBy('priority asc', 'createdAt asc')
      );
      if (!candidate) return;

      const claimed = await db.run(
        UPDATE(entities.CalculationRuns)
          .set({
            status: 'RUNNING',
            claimedBy: this.workerId,
            claimedAt: new Date().toISOString(),
            heartbeatAt: new Date().toISOString(),
            version: { '+=': 1 }
          })
          .where({ ID: candidate.ID, status: 'QUEUED' })
      );
      if (!claimed) return;

      await this.process(candidate.ID, db, entities);
    } catch (error) {
      LOG.error('Calculation worker poll failed', error);
    } finally {
      this.running = false;
    }
  }

  async process(runId, db, entities) {
    try {
      const run = await db.run(SELECT.one.from(entities.CalculationRuns).where({ ID: runId }));
      const priceChange = await db.run(
        SELECT.one.from(entities.PriceChangeRequests).where({ ID: run.priceChange_ID })
      );
      const settings = await db.run(SELECT.from(entities.AppSettings));
      const config = { ...toConfig(settings), ...JSON.parse(run.configSnapshot || '{}') };
      const roundingScale = Number(config.CALCULATION_ROUNDING_SCALE ?? 2);
      const chunkSize = Number(config.CALCULATION_CHUNK_SIZE ?? 500);

      const [movementRules, profiles] = await Promise.all([
        db.run(SELECT.from(entities.MovementTypeRules)),
        db.run(
          SELECT.from(entities.PartProfiles)
            .where({ supplier_ID: priceChange.supplier_ID, status: 'APPROVED' })
            .orderBy('version desc')
        )
      ]);
      const movementMap = new Map(movementRules.map((rule) => [rule.movementType, rule]));
      const profilesByMaterial = new Map();
      for (const profile of profiles) {
        const list = profilesByMaterial.get(profile.material_ID) || [];
        list.push(profile);
        profilesByMaterial.set(profile.material_ID, list);
      }
      const profileIds = profiles.map((profile) => profile.ID);
      const constituents = profileIds.length
        ? await db.run(
            SELECT.from(entities.PartConstituents)
              .where({ profile_ID: { in: profileIds }, grade_ID: priceChange.grade_ID })
              .orderBy('version desc')
          )
        : [];
      const constituentByProfile = new Map();
      for (const constituent of constituents) {
        if (!constituentByProfile.has(constituent.profile_ID)) constituentByProfile.set(constituent.profile_ID, constituent);
      }

      let eligibleGrCount = 0;
      let processedGrCount = 0;
      let exceptionCount = 0;
      let totalEligibleQty = decimal(0);
      let totalAmount = decimal(0);
      let lastReceiptId = null;

      while (true) {
        const receiptWhere = {
          supplier_ID: priceChange.supplier_ID,
          postingDate: { between: run.periodFrom, and: run.periodTo }
        };
        if (lastReceiptId) receiptWhere.ID = { '>': lastReceiptId };
        const receipts = await db.run(
          SELECT.from(entities.GoodsReceipts)
            .where(receiptWhere)
            .orderBy('ID asc')
            .limit(chunkSize)
        );
        if (!receipts.length) break;
        const rows = [];

        for (const receipt of receipts) {
          lastReceiptId = receipt.ID;
          const movementRule = movementMap.get(receipt.movementType);
          if (!movementRule?.eligible) continue;
          eligibleGrCount += 1;
          const profile = (profilesByMaterial.get(receipt.material_ID) || []).find(
            (candidate) => candidate.validFrom <= receipt.postingDate && (!candidate.validTo || candidate.validTo >= receipt.postingDate)
          );
          const constituent = profile && constituentByProfile.get(profile.ID);

          const missingRequiredReference = movementRule.requiresReference && !receipt.reversalOf;
          if (!profile || !constituent || missingRequiredReference) {
            exceptionCount += 1;
            rows.push({
              ID: cds.utils.uuid(),
              run_ID: runId,
              goodsReceipt_ID: receipt.ID,
              profile_ID: profile?.ID || null,
              constituent_ID: null,
              eligibleQuantity: decimal(receipt.quantity).times(movementRule.quantitySign).toString(),
              normalizedRmContent: '0',
              oldPrice: priceChange.oldPrice,
              newPrice: priceChange.proposedPrice,
              priceDelta: decimal(priceChange.proposedPrice).minus(priceChange.oldPrice).toString(),
              amount: '0',
              currency: priceChange.currency,
              included: false,
              exceptionCode: missingRequiredReference ? 'REFERENCE_REQUIRED' : (profile ? 'GRADE_NOT_MAPPED' : 'PROFILE_NOT_FOUND'),
              explanation: missingRequiredReference
                ? 'The configured movement type requires a reversal or source-document reference.'
                : (profile
                    ? 'The approved part profile has no constituent for the changed raw-material grade.'
                    : 'No approved supplier-specific part profile was effective for this goods receipt.')
            });
          } else {
            const impact = calculateImpactLine({
              goodsReceipt: receipt,
              constituent,
              oldPrice: priceChange.oldPrice,
              newPrice: priceChange.proposedPrice,
              priceUnit: priceChange.priceUnit,
              quantitySign: movementRule.quantitySign,
              roundingScale
            });
            rows.push({
              ID: cds.utils.uuid(),
              run_ID: runId,
              goodsReceipt_ID: receipt.ID,
              profile_ID: profile.ID,
              constituent_ID: constituent.ID,
              ...impact,
              currency: priceChange.currency,
              included: true
            });
            totalEligibleQty = totalEligibleQty.plus(impact.eligibleQuantity);
            totalAmount = totalAmount.plus(impact.amount);
          }
          processedGrCount += 1;
        }

        if (rows.length) {
          await db.run(INSERT.into(entities.CalculationLines).entries(rows));
          await db.run(
            UPDATE(entities.CalculationRuns)
              .set({ processedGrCount, heartbeatAt: new Date().toISOString() })
              .where({ ID: runId })
          );
        }
        if (receipts.length < chunkSize) break;
      }

      await db.run(
        UPDATE(entities.CalculationRuns)
          .set({
            status: 'COMPLETED',
            eligibleGrCount,
            processedGrCount,
            exceptionCount,
            totalEligibleQty: totalEligibleQty.toDecimalPlaces(9).toString(),
            totalAmount: totalAmount.toDecimalPlaces(roundingScale).toString(),
            currency: priceChange.currency,
            completedAt: new Date().toISOString(),
            heartbeatAt: new Date().toISOString(),
            version: { '+=': 1 }
          })
          .where({ ID: runId })
      );
      LOG.info(`Calculation ${run.runNumber} completed with ${processedGrCount} GR lines`);
    } catch (error) {
      LOG.error(`Calculation ${runId} failed`, error);
      await db.run(
        UPDATE(entities.CalculationRuns)
          .set({
            status: 'FAILED',
            errorMessage: String(error.message || error).slice(0, 1000),
            heartbeatAt: new Date().toISOString(),
            version: { '+=': 1 }
          })
          .where({ ID: runId })
      );
    }
  }
}

module.exports = { CalculationWorker };
