'use strict';

const cds = require('@sap/cds');
const { decimal } = require('./lib/calculation-engine');
const { toConfig } = require('./lib/configuration');
const { DemoPostingAdapter, stableHash } = require('./lib/demo-posting-adapter');
const { buildPricingWorkbench } = require('./lib/pricing-workbench');
const { normalizeCommodityDraft, assertValidity, lifecycleStatus } = require('./lib/commodity-master');
const { explodeBom, assessComposition, isInOrganizationalScope } = require('./lib/workflow-domain');

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

    this.before('CREATE', 'RawMaterialMasterRequests', (req) => {
      const data = req.data;
      data.ID ||= cds.utils.uuid();
      data.requestNumber ||= `RMR-${new Date().getUTCFullYear()}-${data.ID.slice(0, 8).toUpperCase()}`;
      data.requestType = String(data.requestType || '').toUpperCase();
      if (!['TYPE', 'GRADE', 'SUBGRADE'].includes(data.requestType)) {
        req.reject(400, 'Request type must be TYPE, GRADE or SUBGRADE.');
      }
      if (!data.proposedCode || !data.proposedName || !data.validFrom || !data.reason) {
        req.reject(400, 'Code, name, valid-from date and reason are required.');
      }
      if (data.validTo && data.validTo < data.validFrom) req.reject(400, 'Valid-to date cannot precede valid-from date.');
      data.status = 'DRAFT';
      data.requestedBy = actor(req);
      data.version = 1;
    });

    this.before('UPDATE', 'RawMaterialMasterRequests', async (req) => {
      const ID = req.data.ID || req.params?.[0]?.ID;
      const current = ID && await cds.tx(req).run(
        SELECT.one.from(entities.RawMaterialMasterRequests).where({ ID })
      );
      if (!current) req.reject(404, 'RM master request not found.');
      if (!['DRAFT', 'REJECTED'].includes(current.status)) req.reject(409, `A ${current.status} request cannot be edited.`);
      const controlled = ['status', 'submittedAt', 'decidedBy', 'decidedAt', 'decisionComment', 'createdObjectID'];
      if (controlled.some((field) => Object.prototype.hasOwnProperty.call(req.data, field))) {
        req.reject(400, 'Workflow-controlled fields can be changed only through request actions.');
      }
      req.data.version = Number(current.version) + 1;
    });

    this.before('DELETE', 'RawMaterialMasterRequests', (req) => {
      req.reject(405, 'RM master requests are retained for audit and cannot be deleted.');
    });

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
        'status', 'version', 'submittedAt', 'submittedBy', 'decidedAt', 'decidedBy', 'decisionComment',
        'priceDocumentMode', 'priceDocumentStatus', 'releasedAt', 'releasedBy',
        'documentDecidedAt', 'documentDecidedBy', 'documentDecisionComment'
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

    this.on('getPricingWorkbench', async (req) => {
      const workbench = await this.#pricingWorkbench(cds.tx(req), entities, req, req.data.priceChangeID);
      return workbench.summary;
    });

    this.on('getCostSheet', async (req) => {
      const workbench = await this.#pricingWorkbench(cds.tx(req), entities, req, req.data.priceChangeID);
      return workbench.lines;
    });

    this.on('getImpactBreakdown', async (req) => {
      const workbench = await this.#pricingWorkbench(cds.tx(req), entities, req, req.data.priceChangeID);
      return workbench.breakdown;
    });

    this.on('getImpactedParts', async (req) => {
      const workbench = await this.#pricingWorkbench(cds.tx(req), entities, req, req.data.priceChangeID);
      return workbench.impactedParts;
    });

    this.on('getLegacyControlMatrix', () => [
      { controlId: 'LC-01', area: 'Performance', legacyRisk: 'Long-running CPAR jobs blocked buyers and processed combinations serially.', safeguard: 'Priority queue, atomic claims, chunked processing, progress and failure evidence.', implementationStatus: 'IMPLEMENTED_TRIAL', evidence: 'CalculationRuns and calculation-worker.js' },
      { controlId: 'LC-02', area: 'Data integrity', legacyRisk: 'Duplicate or triplicate S/4 quantities distorted provision results.', safeguard: 'Unique source-document identity, reversal-aware quantities, calculation lineage and reconciliation.', implementationStatus: 'IMPLEMENTED_TRIAL', evidence: 'GoodsReceipts, CalculationLines and ReconciliationRecords' },
      { controlId: 'LC-03', area: 'Vendor-part linkage', legacyRisk: 'Missing contracts, duplicate exposure lines and validity gaps required manual selection.', safeguard: 'Effective-dated linkage, overlap rejection, valid-contract search and governed missing-contract exception.', implementationStatus: 'IMPLEMENTED', evidence: 'VendorPartLinkages workflow actions' },
      { controlId: 'LC-04', area: 'Master governance', legacyRisk: 'Buyer-created duplicate RM types and grades reduced data quality.', safeguard: 'RM Admin activation, unique codes, validity, deletion markers and immutable approval evidence.', implementationStatus: 'IMPLEMENTED', evidence: 'RawMaterialMasterRequests and governed master actions' },
      { controlId: 'LC-05', area: 'Weight accuracy', legacyRisk: 'Total input weight was not recalculated when VPL line weights changed.', safeguard: 'Server recalculation, weight-balance validation, completeness scoring and approved snapshot hash.', implementationStatus: 'IMPLEMENTED', evidence: 'mapCompositionLeaf and assessComposition' },
      { controlId: 'LC-06', area: 'Amendment correctness', legacyRisk: 'Multiple plants, vendors and dates could produce incorrect or fragmented results.', safeguard: 'Explicit supplier/plant/contract scope, effective dates, immutable runs and duplicate-period blocking.', implementationStatus: 'IMPLEMENTED_TRIAL', evidence: 'PriceChangeRequests and queueCalculation' },
      { controlId: 'LC-07', area: 'Approval', legacyRisk: 'Unclear approval status, unreadable attachments and repeated decisions weakened control.', safeguard: 'Status state machine, mandatory rejection remarks, optimistic versioning and retained approval records.', implementationStatus: 'IMPLEMENTED_TRIAL', evidence: 'ApprovalRecords and governed decision actions' },
      { controlId: 'LC-08', area: 'Traceability', legacyRisk: 'Background reports lacked a reliable reference ID.', safeguard: 'Run numbers, proposal numbers, idempotency keys and correlation IDs link every execution and handoff.', implementationStatus: 'IMPLEMENTED', evidence: 'CalculationRuns, ContractPriceProposals, PostingRecords and SystemEvents' },
      { controlId: 'LC-09', area: 'Bulk maintenance', legacyRisk: 'Uploads did not identify the exact row, column and field error.', safeguard: 'Preview-first bulk validation with downloadable row-level errors.', implementationStatus: 'PLANNED_T2', evidence: 'Legacy parity backlog; not yet exposed in trial UI' },
      { controlId: 'LC-10', area: 'Identity and roles', legacyRisk: 'Login and manual role assignment failures delayed onboarding.', safeguard: 'Target IAS/XSUAA SSO, role collections and organizational attributes; trial uses dummy identity only.', implementationStatus: 'GATED_FOR_PRODUCTION', evidence: 'xs-security.json and Gate T3 boundary' },
      { controlId: 'LC-11', area: 'Notifications', legacyRisk: 'Pending approvals required manual follow-up and email attachments were fragile.', safeguard: 'In-app worklists are present; reminders and enterprise notification remain a gated adapter.', implementationStatus: 'PARTIAL', evidence: 'Workflow worklists; notification adapter pending approval' },
      { controlId: 'LC-12', area: 'Financial parity', legacyRisk: 'Plus-1, MASOP, offcut, scrap and surface-protection rules produced disputed outcomes.', safeguard: 'Exact decimal server engine and explainable traces are implemented; legacy formulas require Finance sign-off before activation.', implementationStatus: 'AWAITING_FINANCE_RULES', evidence: 'calculation-engine.js and LEGACY_RMCM_PARITY_AUDIT.md' }
    ]);

    this.on('createCommodity', async (req) => {
      let draft;
      try {
        draft = normalizeCommodityDraft(req.data);
      } catch (error) {
        req.reject(400, error.message);
      }
      const tx = cds.tx(req);
      const duplicate = await tx.run(SELECT.one.from(entities.Commodities).where({ code: draft.code }));
      if (duplicate) req.reject(409, `Commodity ${draft.code} already exists.`);
      const ID = cds.utils.uuid();
      await tx.run(INSERT.into(entities.Commodities).entries({
        ID,
        ...draft,
        status: lifecycleStatus(draft.validTo, false),
        markedForDeletion: false,
        owner: actor(req),
        version: 1
      }));
      await this.#audit(tx, entities, req, 'COMMODITY', ID, 1, 'CREATED', `Commodity ${draft.code} created.`, 'CommodityAdmin');
      return tx.run(SELECT.one.from(entities.Commodities).where({ ID }));
    });

    this.on('closeCommodityValidity', async (req) => {
      const { commodityID, expectedVersion, validTo } = req.data;
      const tx = cds.tx(req);
      const record = await tx.run(SELECT.one.from(entities.Commodities).where({ ID: commodityID }));
      assertVersion(req, record, expectedVersion);
      if (!validTo) req.reject(400, 'A valid-to date is required.');
      try {
        assertValidity(record.validFrom, validTo);
      } catch (error) {
        req.reject(400, error.message);
      }
      if (record.validTo && validTo > record.validTo) {
        req.reject(400, 'Closing validity cannot extend the current valid-to date.');
      }
      const nextVersion = Number(record.version) + 1;
      const status = lifecycleStatus(validTo, record.markedForDeletion);
      const changed = await tx.run(
        UPDATE(entities.Commodities)
          .set({ validTo, status, version: nextVersion })
          .where({ ID: commodityID, version: Number(expectedVersion) })
      );
      if (!changed) req.reject(409, 'The commodity changed after it was loaded.');
      await this.#audit(tx, entities, req, 'COMMODITY', commodityID, nextVersion, 'VALIDITY_CLOSED', `Validity closed on ${validTo}.`, 'CommodityAdmin');
      return tx.run(SELECT.one.from(entities.Commodities).where({ ID: commodityID }));
    });

    this.on('setCommodityDeletionMarker', async (req) => {
      const { commodityID, expectedVersion } = req.data;
      const markedForDeletion = req.data.markedForDeletion === true;
      const tx = cds.tx(req);
      const record = await tx.run(SELECT.one.from(entities.Commodities).where({ ID: commodityID }));
      assertVersion(req, record, expectedVersion);
      if (Boolean(record.markedForDeletion) === markedForDeletion) {
        req.reject(409, `Commodity is already ${markedForDeletion ? 'marked for deletion' : 'unmarked'}.`);
      }
      const nextVersion = Number(record.version) + 1;
      const status = lifecycleStatus(record.validTo, markedForDeletion);
      const changed = await tx.run(
        UPDATE(entities.Commodities)
          .set({ markedForDeletion, status, version: nextVersion })
          .where({ ID: commodityID, version: Number(expectedVersion) })
      );
      if (!changed) req.reject(409, 'The commodity changed after it was loaded.');
      const decision = markedForDeletion ? 'DELETION_MARKED' : 'DELETION_CLEARED';
      await this.#audit(tx, entities, req, 'COMMODITY', commodityID, nextVersion, decision, null, 'CommodityAdmin');
      return tx.run(SELECT.one.from(entities.Commodities).where({ ID: commodityID }));
    });

    this.on('searchValidContractItems', async (req) => {
      const { supplierID, materialID, plant } = req.data;
      const businessDate = req.data.businessDate || new Date().toISOString().slice(0, 10);
      if (!supplierID || !materialID || !plant) req.reject(400, 'Supplier, material and plant are required.');
      const tx = cds.tx(req);
      const [supplier, material, items, contracts] = await Promise.all([
        tx.run(SELECT.one.from(entities.Suppliers).where({ ID: supplierID })),
        tx.run(SELECT.one.from(entities.Materials).where({ ID: materialID })),
        tx.run(SELECT.from(entities.ContractItems).where({ material_ID: materialID, plant, status: 'ACTIVE' })),
        tx.run(SELECT.from(entities.Contracts).where({ supplier_ID: supplierID, releaseStatus: 'RELEASED' }))
      ]);
      if (!supplier || !material) req.reject(404, 'Supplier or material not found.');
      this.#assertScope(req, { plant, purchasingOrg: supplier.purchasingOrg, supplierCode: supplier.code });
      const contractById = new Map(contracts
        .filter((row) => row.validFrom <= businessDate && row.validTo >= businessDate)
        .map((row) => [row.ID, row]));
      return items.filter((item) => contractById.has(item.contract_ID)).map((item) => {
        const contract = contractById.get(item.contract_ID);
        return {
          contractItemID: item.ID,
          contractNumber: contract.contractNumber,
          itemNumber: item.itemNumber,
          supplierCode: supplier.code,
          materialCode: material.code,
          plant: item.plant,
          purchasingOrg: contract.purchasingOrg,
          companyCode: contract.companyCode,
          validFrom: contract.validFrom,
          validTo: contract.validTo,
          currency: contract.currency,
          currentPrice: item.currentPrice,
          priceUnit: item.priceUnit,
          orderPriceUnit: item.orderPriceUnit
        };
      });
    });

    this.on('createVendorPartLinkage', async (req) => {
      const data = req.data;
      if (!data.supplierID || !data.materialID || !data.plant || !data.revisionLevel || !data.validFrom) {
        req.reject(400, 'Supplier, material, plant, revision and valid-from date are required.');
      }
      try {
        assertValidity(data.validFrom, data.validTo);
      } catch (error) {
        req.reject(400, error.message);
      }
      const tx = cds.tx(req);
      const [supplier, material, existing] = await Promise.all([
        tx.run(SELECT.one.from(entities.Suppliers).where({ ID: data.supplierID })),
        tx.run(SELECT.one.from(entities.Materials).where({ ID: data.materialID })),
        tx.run(SELECT.from(entities.VendorPartLinkages).where({ supplier_ID: data.supplierID, material_ID: data.materialID, plant: data.plant, revisionLevel: data.revisionLevel }))
      ]);
      if (!supplier || !material) req.reject(404, 'Supplier or material not found.');
      this.#assertScope(req, { plant: data.plant, purchasingOrg: data.purchasingOrg || supplier.purchasingOrg, supplierCode: supplier.code });
      if (existing.some((row) => (!row.validTo || row.validTo >= data.validFrom) && (!data.validTo || row.validFrom <= data.validTo))) {
        req.reject(409, 'An overlapping vendor-part linkage already exists for this revision.');
      }
      let contractItem = null;
      if (data.contractItemID) {
        contractItem = await this.#validateContract(tx, entities, req, data.contractItemID, data.supplierID, data.materialID, data.plant, data.validFrom);
      } else if (!String(data.missingContractReason || '').trim()) {
        req.reject(400, 'A missing-contract reason is required when no valid contract is allocated.');
      }
      const ID = cds.utils.uuid();
      const hasContract = Boolean(contractItem);
      const linkageType = String(data.linkageType || 'BOUGHT_OUT').toUpperCase();
      const partType = String(data.partType || 'BOUGHT_OUT').toUpperCase();
      if (!['MASOP', 'BOUGHT_OUT'].includes(linkageType)) req.reject(400, 'Linkage type must be MASOP or BOUGHT_OUT.');
      if (!['MASOP_RM', 'MASOP_BOP', 'BOUGHT_OUT'].includes(partType)) req.reject(400, 'Part type must be MASOP_RM, MASOP_BOP or BOUGHT_OUT.');
      if (linkageType !== 'MASOP' && partType !== 'BOUGHT_OUT') req.reject(400, 'MASOP part types require a MASOP linkage.');
      if (data.initialSettledRate != null && decimal(data.initialSettledRate).lt(0)) req.reject(400, 'Initial settled rate cannot be negative.');
      await tx.run(INSERT.into(entities.VendorPartLinkages).entries({
        ID,
        supplier_ID: data.supplierID,
        material_ID: data.materialID,
        plant: data.plant,
        purchasingOrg: data.purchasingOrg || supplier.purchasingOrg,
        linkageType,
        partType,
        indexingFrequency: data.indexingFrequency || null,
        initialSettledRate: data.initialSettledRate ?? null,
        initialRateCurrency: data.initialRateCurrency || null,
        preliminaryExposure: Boolean(data.preliminaryExposure),
        sourceReference: data.sourceReference || null,
        contractItem_ID: contractItem?.ID || null,
        revisionLevel: String(data.revisionLevel).trim(),
        validFrom: data.validFrom,
        validTo: data.validTo || null,
        status: hasContract ? 'APPROVED' : 'SUBMITTED',
        contractStatus: hasContract ? 'ALLOCATED' : 'MISSING_CONTRACT',
        missingContractReason: hasContract ? null : String(data.missingContractReason).trim(),
        exceptionApprovalStatus: hasContract ? 'NOT_REQUIRED' : 'PENDING_APPROVAL',
        contractAllocatedBy: hasContract ? actor(req) : null,
        contractAllocatedAt: hasContract ? new Date().toISOString() : null,
        createdByPersona: 'BUYER',
        version: 1
      }));
      if (!hasContract) {
        await this.#createFinding(tx, entities, 'VENDOR_PART_LINKAGE', ID, 'MISSING_CONTRACT', true, String(data.missingContractReason).trim());
      }
      await this.#audit(tx, entities, req, 'VENDOR_PART_LINKAGE', ID, 1, hasContract ? 'ALLOCATED' : 'EXCEPTION_REQUESTED', data.missingContractReason, 'Buyer');
      return tx.run(SELECT.one.from(entities.VendorPartLinkages).where({ ID }));
    });

    this.on('decideContractException', async (req) => {
      const normalized = String(req.data.decision || '').toUpperCase();
      if (!['APPROVE', 'REJECT'].includes(normalized)) req.reject(400, 'Decision must be APPROVE or REJECT.');
      if (normalized === 'REJECT' && !req.data.comment) req.reject(400, 'A rejection comment is required.');
      const tx = cds.tx(req);
      const record = await tx.run(SELECT.one.from(entities.VendorPartLinkages).where({ ID: req.data.linkageID }));
      assertVersion(req, record, req.data.expectedVersion);
      if (record.exceptionApprovalStatus !== 'PENDING_APPROVAL') req.reject(409, 'This linkage has no pending contract exception.');
      const supplier = await tx.run(SELECT.one.from(entities.Suppliers).where({ ID: record.supplier_ID }));
      this.#assertScope(req, { plant: record.plant, purchasingOrg: record.purchasingOrg, supplierCode: supplier?.code });
      const approved = normalized === 'APPROVE';
      const nextVersion = Number(record.version) + 1;
      const changed = await tx.run(UPDATE(entities.VendorPartLinkages).set({
        status: approved ? 'APPROVED' : 'REJECTED',
        contractStatus: approved ? 'MISSING_APPROVED' : 'MISSING_REJECTED',
        exceptionApprovalStatus: approved ? 'APPROVED' : 'REJECTED',
        exceptionApprovedBy: actor(req),
        exceptionApprovedAt: new Date().toISOString(),
        version: nextVersion
      }).where({ ID: record.ID, version: Number(req.data.expectedVersion) }));
      if (!changed) req.reject(409, 'The linkage changed after it was loaded.');
      if (approved) await this.#closeFindings(tx, entities, 'VENDOR_PART_LINKAGE', record.ID, 'MISSING_CONTRACT', actor(req), req.data.comment || 'Approved no-contract exception.');
      await this.#audit(tx, entities, req, 'CONTRACT_EXCEPTION', record.ID, nextVersion, approved ? 'APPROVED' : 'REJECTED', req.data.comment, 'CompositionApprover');
      return tx.run(SELECT.one.from(entities.VendorPartLinkages).where({ ID: record.ID }));
    });

    this.on('allocateContract', async (req) => {
      const tx = cds.tx(req);
      const record = await tx.run(SELECT.one.from(entities.VendorPartLinkages).where({ ID: req.data.linkageID }));
      assertVersion(req, record, req.data.expectedVersion);
      const businessDate = req.data.businessDate || record.validFrom;
      const supplier = await tx.run(SELECT.one.from(entities.Suppliers).where({ ID: record.supplier_ID }));
      this.#assertScope(req, { plant: record.plant, purchasingOrg: record.purchasingOrg, supplierCode: supplier?.code });
      const contractItem = await this.#validateContract(tx, entities, req, req.data.contractItemID, record.supplier_ID, record.material_ID, record.plant, businessDate);
      const nextVersion = Number(record.version) + 1;
      const changed = await tx.run(UPDATE(entities.VendorPartLinkages).set({
        contractItem_ID: contractItem.ID,
        contractStatus: 'ALLOCATED',
        status: 'APPROVED',
        contractAllocatedBy: actor(req),
        contractAllocatedAt: new Date().toISOString(),
        version: nextVersion
      }).where({ ID: record.ID, version: Number(req.data.expectedVersion) }));
      if (!changed) req.reject(409, 'The linkage changed after it was loaded.');
      await this.#closeFindings(tx, entities, 'VENDOR_PART_LINKAGE', record.ID, 'MISSING_CONTRACT', actor(req), 'Contract allocated later.');
      await this.#audit(tx, entities, req, 'VENDOR_PART_LINKAGE', record.ID, nextVersion, 'CONTRACT_ALLOCATED', null, 'Buyer');
      return tx.run(SELECT.one.from(entities.VendorPartLinkages).where({ ID: record.ID }));
    });

    this.on('getBomHierarchy', async (req) => {
      const tx = cds.tx(req);
      return this.#bomHierarchy(tx, entities, req, req.data.materialID, req.data.plant, req.data.keyDate || new Date().toISOString().slice(0, 10));
    });

    this.on('createCompositionRevision', async (req) => {
      const tx = cds.tx(req);
      const linkage = await tx.run(SELECT.one.from(entities.VendorPartLinkages).where({ ID: req.data.linkageID }));
      assertVersion(req, linkage, req.data.expectedVersion);
      if (linkage.contractStatus !== 'ALLOCATED' && linkage.exceptionApprovalStatus !== 'APPROVED') {
        req.reject(409, 'Allocate a valid contract or obtain no-contract exception approval first.');
      }
      try {
        assertValidity(req.data.validFrom, req.data.validTo);
      } catch (error) {
        req.reject(400, error.message);
      }
      const [supplier, header, existingProfiles] = await Promise.all([
        tx.run(SELECT.one.from(entities.Suppliers).where({ ID: linkage.supplier_ID })),
        tx.run(SELECT.one.from(entities.BomHeaders).where({ ID: req.data.bomHeaderID })),
        tx.run(SELECT.from(entities.PartProfiles).where({ supplier_ID: linkage.supplier_ID, material_ID: linkage.material_ID }))
      ]);
      if (!header || header.material_ID !== linkage.material_ID || header.plant !== linkage.plant) req.reject(400, 'The selected BOM does not match the linkage material and plant.');
      this.#assertScope(req, { plant: linkage.plant, purchasingOrg: linkage.purchasingOrg, supplierCode: supplier?.code });
      const ID = cds.utils.uuid();
      const revisionLevel = `${linkage.revisionLevel}.${String(existingProfiles.length + 1).padStart(2, '0')}`;
      const now = new Date().toISOString();
      await tx.run(INSERT.into(entities.PartProfiles).entries({
        ID,
        linkage_ID: linkage.ID,
        material_ID: linkage.material_ID,
        supplier_ID: linkage.supplier_ID,
        contractItem_ID: linkage.contractItem_ID || null,
        bomHeader_ID: header.ID,
        validFrom: req.data.validFrom,
        validTo: req.data.validTo || null,
        revisionLevel,
        bomExplodedAt: now,
        maxBomDepth: 20,
        contractExceptionRequired: linkage.contractStatus !== 'ALLOCATED',
        contractExceptionStatus: linkage.exceptionApprovalStatus,
        contractAllocatedAt: linkage.contractAllocatedAt,
        status: 'DRAFT',
        completenessPct: 0,
        totalRmContent: 0,
        version: 1
      }));
      const previous = existingProfiles.filter((row) => row.status === 'APPROVED').sort((a, b) => String(b.approvedAt).localeCompare(String(a.approvedAt)))[0];
      if (previous) {
        const oldLines = await tx.run(SELECT.from(entities.PartConstituents).where({ profile_ID: previous.ID }));
        if (oldLines.length) await tx.run(INSERT.into(entities.PartConstituents).entries(oldLines.map((line) => ({
          ...line, ID: cds.utils.uuid(), profile_ID: ID, version: 1, createdAt: undefined, createdBy: undefined, modifiedAt: undefined, modifiedBy: undefined
        }))));
      }
      await this.#refreshCompositionFindings(tx, entities, req, ID);
      await this.#audit(tx, entities, req, 'COMPOSITION', ID, 1, 'REVISION_CREATED', null, 'Buyer');
      return tx.run(SELECT.one.from(entities.PartProfiles).where({ ID }));
    });

    this.on('mapCompositionLeaf', async (req) => {
      const tx = cds.tx(req);
      const profile = await tx.run(SELECT.one.from(entities.PartProfiles).where({ ID: req.data.profileID }));
      assertVersion(req, profile, req.data.expectedVersion);
      if (!['DRAFT', 'REJECTED'].includes(profile.status)) req.reject(409, `A ${profile.status} composition cannot be edited.`);
      const [supplier, grade, subGrade] = await Promise.all([
        tx.run(SELECT.one.from(entities.Suppliers).where({ ID: profile.supplier_ID })),
        tx.run(SELECT.one.from(entities.RawMaterialGrades).where({ ID: req.data.gradeID })),
        req.data.subGradeID ? tx.run(SELECT.one.from(entities.RawMaterialSubGrades).where({ ID: req.data.subGradeID })) : null
      ]);
      this.#assertScope(req, { plant: (await tx.run(SELECT.one.from(entities.Materials).where({ ID: profile.material_ID })))?.plant, supplierCode: supplier?.code });
      if (!grade || grade.status !== 'ACTIVE' || grade.markedForDeletion) req.reject(400, 'Select an active RM grade.');
      if (subGrade && (subGrade.grade_ID !== grade.ID || subGrade.status !== 'ACTIVE' || subGrade.markedForDeletion)) req.reject(400, 'The selected subgrade is not active under this grade.');
      if (!req.data.uoM || decimal(req.data.inputWeight || 0).lte(0) || decimal(req.data.outputWeight || 0).lte(0) || decimal(req.data.scrapWeight || 0).lt(0)) {
        req.reject(400, 'Positive input/output weights, non-negative scrap and UoM are required.');
      }
      if (decimal(req.data.outputWeight).plus(req.data.scrapWeight || 0).gt(req.data.inputWeight)) req.reject(400, 'Output plus scrap cannot exceed input weight.');
      if (req.data.minimumThickness != null && req.data.maximumThickness != null && decimal(req.data.minimumThickness).gt(req.data.maximumThickness)) {
        req.reject(400, 'Minimum thickness cannot exceed maximum thickness.');
      }
      for (const field of ['offcutPct', 'scrapYieldPct', 'talcPct']) {
        if (req.data[field] != null && (decimal(req.data[field]).lt(0) || decimal(req.data[field]).gt(100))) req.reject(400, `${field} must be between 0 and 100.`);
      }
      for (const field of ['minimumThickness', 'maximumThickness', 'tubeOutsideDiameter', 'length', 'width', 'numberOfBlanks', 'plmWeight', 'finishWeight', 'forgeCastWeight', 'offcutWeight', 'surfaceArea', 'surfaceProtectionCost', 'boughtOutCost', 'packagingTermsCost', 'polypropyleneContent']) {
        if (req.data[field] != null && decimal(req.data[field]).lt(0)) req.reject(400, `${field} cannot be negative.`);
      }
      if (req.data.impactModifier != null && decimal(req.data.impactModifier).lte(0)) req.reject(400, 'Impact modifier must be greater than zero.');
      const material = await tx.run(SELECT.one.from(entities.Materials).where({ ID: profile.material_ID }));
      const nodes = await this.#bomHierarchy(tx, entities, req, profile.material_ID, material.plant, profile.validFrom);
      const leaf = nodes.find((node) => node.bomItemID === req.data.bomItemID && node.leafPart);
      if (!leaf) req.reject(400, 'Composition can be mapped only to a BOM leaf.');
      const existing = await tx.run(SELECT.one.from(entities.PartConstituents).where({ profile_ID: profile.ID, bomItem_ID: leaf.bomItemID }));
      const line = {
        profile_ID: profile.ID,
        bomItem_ID: leaf.bomItemID,
        grade_ID: grade.ID,
        subGrade_ID: subGrade?.ID || null,
        parentMaterial_ID: leaf.parentMaterialID,
        hierarchyDepth: leaf.hierarchyDepth,
        lineagePath: leaf.lineagePath,
        leafPart: true,
        contentQuantity: req.data.outputWeight,
        contentUoM: String(req.data.uoM).toUpperCase(),
        inputWeight: req.data.inputWeight,
        outputWeight: req.data.outputWeight,
        scrapWeight: req.data.scrapWeight || 0,
        minimumThickness: req.data.minimumThickness ?? null,
        maximumThickness: req.data.maximumThickness ?? null,
        tubeOutsideDiameter: req.data.tubeOutsideDiameter ?? null,
        length: req.data.length ?? null,
        width: req.data.width ?? null,
        numberOfBlanks: req.data.numberOfBlanks ?? null,
        plmWeight: req.data.plmWeight ?? null,
        finishWeight: req.data.finishWeight ?? null,
        forgeCastWeight: req.data.forgeCastWeight ?? null,
        offcutWeight: req.data.offcutWeight ?? null,
        offcutPct: req.data.offcutPct ?? null,
        scrapYieldPct: req.data.scrapYieldPct ?? null,
        surfaceArea: req.data.surfaceArea ?? null,
        surfaceAreaUoM: req.data.surfaceAreaUoM || null,
        surfaceProcess: req.data.surfaceProcess || null,
        surfaceProtectionCost: req.data.surfaceProtectionCost ?? null,
        boughtOutCost: req.data.boughtOutCost ?? null,
        packagingTermsCost: req.data.packagingTermsCost ?? null,
        polypropyleneContent: req.data.polypropyleneContent ?? null,
        talcPct: req.data.talcPct ?? null,
        impactModifier: req.data.impactModifier ?? 1,
        yieldFactor: decimal(req.data.outputWeight).div(req.data.inputWeight).toFixed(9),
        scrapFactor: 1,
        source: req.data.overrideReason ? 'MANUAL' : 'BOM',
        overrideReason: req.data.overrideReason || null
      };
      if (existing) await tx.run(UPDATE(entities.PartConstituents).set({ ...line, version: Number(existing.version) + 1 }).where({ ID: existing.ID, version: Number(existing.version) }));
      else await tx.run(INSERT.into(entities.PartConstituents).entries({ ID: cds.utils.uuid(), ...line, version: 1 }));
      const nextVersion = Number(profile.version) + 1;
      await tx.run(UPDATE(entities.PartProfiles).set({ version: nextVersion }).where({ ID: profile.ID, version: Number(req.data.expectedVersion) }));
      await this.#refreshCompositionFindings(tx, entities, req, profile.ID);
      return tx.run(SELECT.one.from(entities.PartProfiles).where({ ID: profile.ID }));
    });

    this.on('submitComposition', async (req) => {
      const tx = cds.tx(req);
      const profile = await tx.run(SELECT.one.from(entities.PartProfiles).where({ ID: req.data.profileID }));
      assertVersion(req, profile, req.data.expectedVersion);
      if (!['DRAFT', 'REJECTED'].includes(profile.status)) req.reject(409, `A ${profile.status} composition cannot be submitted.`);
      await this.#refreshCompositionFindings(tx, entities, req, profile.ID);
      const open = await tx.run(SELECT.one.from(entities.WorkflowExceptions).where({ objectType: 'COMPOSITION', objectID: profile.ID, mandatory: true, status: 'OPEN' }));
      if (open) req.reject(409, `Resolve mandatory finding ${open.code} before submission.`);
      const nextVersion = Number(profile.version) + 1;
      await tx.run(UPDATE(entities.PartProfiles).set({ status: 'SUBMITTED', submittedAt: new Date().toISOString(), submittedBy: actor(req), version: nextVersion }).where({ ID: profile.ID, version: Number(req.data.expectedVersion) }));
      await this.#audit(tx, entities, req, 'COMPOSITION', profile.ID, nextVersion, 'SUBMITTED', null, 'Buyer');
      return tx.run(SELECT.one.from(entities.PartProfiles).where({ ID: profile.ID }));
    });

    this.on('decideComposition', async (req) => {
      const normalized = String(req.data.decision || '').toUpperCase();
      if (!['APPROVE', 'REJECT'].includes(normalized)) req.reject(400, 'Decision must be APPROVE or REJECT.');
      if (normalized === 'REJECT' && !req.data.comment) req.reject(400, 'A rejection comment is required.');
      const tx = cds.tx(req);
      const profile = await tx.run(SELECT.one.from(entities.PartProfiles).where({ ID: req.data.profileID }));
      assertVersion(req, profile, req.data.expectedVersion);
      if (profile.status !== 'SUBMITTED') req.reject(409, `A ${profile.status} composition cannot be decided.`);
      await this.#refreshCompositionFindings(tx, entities, req, profile.ID);
      const open = await tx.run(SELECT.one.from(entities.WorkflowExceptions).where({ objectType: 'COMPOSITION', objectID: profile.ID, mandatory: true, status: 'OPEN' }));
      if (normalized === 'APPROVE' && open) req.reject(409, `Approval is blocked by ${open.code}.`);
      const approved = normalized === 'APPROVE';
      const nextVersion = Number(profile.version) + 1;
      const constituents = await tx.run(SELECT.from(entities.PartConstituents).where({ profile_ID: profile.ID }));
      const totalRmContent = constituents.reduce((sum, row) => sum.plus(row.outputWeight || 0), decimal(0)).toFixed(9);
      await tx.run(UPDATE(entities.PartProfiles).set({
        status: approved ? 'APPROVED' : 'REJECTED',
        approvedAt: approved ? new Date().toISOString() : null,
        approvedBy: approved ? actor(req) : null,
        snapshotHash: approved ? stableHash({ profile, constituents }) : null,
        totalRmContent,
        normalizedUoM: constituents[0]?.contentUoM || null,
        version: nextVersion
      }).where({ ID: profile.ID, version: Number(req.data.expectedVersion) }));
      await this.#audit(tx, entities, req, 'COMPOSITION', profile.ID, nextVersion, approved ? 'APPROVED' : 'REJECTED', req.data.comment, 'CompositionApprover');
      return tx.run(SELECT.one.from(entities.PartProfiles).where({ ID: profile.ID }));
    });

    this.on('resolveWorkflowException', async (req) => {
      if (!String(req.data.resolution || '').trim()) req.reject(400, 'A resolution comment is required.');
      const tx = cds.tx(req);
      const record = await tx.run(SELECT.one.from(entities.WorkflowExceptions).where({ ID: req.data.exceptionID }));
      assertVersion(req, record, req.data.expectedVersion);
      if (record.status !== 'OPEN') req.reject(409, `A ${record.status} finding cannot be resolved again.`);
      if (req.data.exclude && record.mandatory) req.reject(409, 'Mandatory findings cannot be excluded. Correct the underlying data.');
      const nextVersion = Number(record.version) + 1;
      await tx.run(UPDATE(entities.WorkflowExceptions).set({
        status: req.data.exclude ? 'EXCLUDED' : 'RESOLVED',
        resolution: String(req.data.resolution).trim(),
        resolvedBy: actor(req),
        resolvedAt: new Date().toISOString(),
        version: nextVersion
      }).where({ ID: record.ID, version: Number(req.data.expectedVersion) }));
      await this.#audit(tx, entities, req, 'WORKFLOW_EXCEPTION', record.ID, nextVersion, req.data.exclude ? 'EXCLUDED' : 'RESOLVED', req.data.resolution, 'CompositionApprover');
      return tx.run(SELECT.one.from(entities.WorkflowExceptions).where({ ID: record.ID }));
    });

    this.on('reconcilePriceChange', async (req) => {
      const tx = cds.tx(req);
      const priceChange = await tx.run(SELECT.one.from(entities.PriceChangeRequests).where({ ID: req.data.priceChangeID }));
      if (!priceChange) req.reject(404, 'Price change not found.');
      if (priceChange.priceDocumentStatus !== 'APPROVED') req.reject(409, 'Only an approved price document can be reconciled.');
      const proposal = await tx.run(SELECT.one.from(entities.ContractPriceProposals).where({ priceChange_ID: priceChange.ID }).orderBy('createdAt desc'));
      if (!proposal) req.reject(409, 'No approved contract-price proposal exists for reconciliation.');
      const workbench = await this.#pricingWorkbench(tx, entities, req, priceChange.ID);
      const expected = decimal(workbench.summary.revisedPoPrice);
      const actual = decimal(proposal.proposedPrice);
      const difference = actual.minus(expected);
      const ID = cds.utils.uuid();
      await tx.run(INSERT.into(entities.ReconciliationRecords).entries({
        ID,
        objectType: 'PRICE_CHANGE',
        objectID: priceChange.ID,
        expectedAmount: expected.toFixed(6),
        actualAmount: actual.toFixed(6),
        differenceAmount: difference.toFixed(6),
        currency: proposal.currency,
        status: difference.isZero() ? 'MATCHED' : 'DIFFERENCE',
        explanation: difference.isZero() ? 'Approved proposal matches the server-calculated workbench price.' : 'Approved proposal differs from the server-calculated workbench price.',
        reconciledBy: actor(req),
        reconciledAt: new Date().toISOString(),
        version: 1
      }));
      await this.#audit(tx, entities, req, 'RECONCILIATION', ID, 1, difference.isZero() ? 'MATCHED' : 'DIFFERENCE', null, 'RmcAuditor');
      return tx.run(SELECT.one.from(entities.ReconciliationRecords).where({ ID }));
    });

    this.on('submitRmMasterRequest', async (req) => {
      const { requestID, expectedVersion } = req.data;
      const tx = cds.tx(req);
      const record = await tx.run(SELECT.one.from(entities.RawMaterialMasterRequests).where({ ID: requestID }));
      assertVersion(req, record, expectedVersion);
      if (!['DRAFT', 'REJECTED'].includes(record.status)) req.reject(409, `A ${record.status} request cannot be submitted.`);
      const changed = await tx.run(
        UPDATE(entities.RawMaterialMasterRequests)
          .set({ status: 'SUBMITTED', submittedAt: new Date().toISOString(), version: Number(record.version) + 1 })
          .where({ ID: requestID, version: Number(expectedVersion) })
      );
      if (!changed) req.reject(409, 'The request changed after it was loaded.');
      await this.#audit(tx, entities, req, 'RM_MASTER_REQUEST', requestID, Number(record.version) + 1, 'SUBMITTED', null, 'Buyer');
      return tx.run(SELECT.one.from(entities.RawMaterialMasterRequests).where({ ID: requestID }));
    });

    this.on('decideRmMasterRequest', async (req) => {
      const { requestID, expectedVersion, decision, comment } = req.data;
      const normalized = String(decision || '').toUpperCase();
      if (!['APPROVE', 'REJECT'].includes(normalized)) req.reject(400, 'Decision must be APPROVE or REJECT.');
      if (normalized === 'REJECT' && !comment) req.reject(400, 'A rejection comment is required.');
      const tx = cds.tx(req);
      const record = await tx.run(SELECT.one.from(entities.RawMaterialMasterRequests).where({ ID: requestID }));
      assertVersion(req, record, expectedVersion);
      if (record.status !== 'SUBMITTED') req.reject(409, `A ${record.status} request cannot be decided.`);

      let createdObjectID = null;
      if (normalized === 'APPROVE') createdObjectID = await this.#createRequestedMaster(tx, entities, req, record);
      const status = normalized === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      const changed = await tx.run(
        UPDATE(entities.RawMaterialMasterRequests)
          .set({
            status,
            decidedBy: actor(req),
            decidedAt: new Date().toISOString(),
            decisionComment: comment || null,
            createdObjectID,
            version: Number(record.version) + 1
          })
          .where({ ID: requestID, version: Number(expectedVersion) })
      );
      if (!changed) req.reject(409, 'The request changed after it was loaded.');
      await this.#audit(tx, entities, req, 'RM_MASTER_REQUEST', requestID, Number(record.version) + 1, status, comment, 'RmAdmin');
      return tx.run(SELECT.one.from(entities.RawMaterialMasterRequests).where({ ID: requestID }));
    });

    this.on('createPriceChange', async (req) => {
      const data = req.data;
      const mode = String(data.inputMode || 'ABSOLUTE').toUpperCase();
      if (!['ABSOLUTE', 'DELTA'].includes(mode)) req.reject(400, 'Input mode must be ABSOLUTE or DELTA.');
      if (!data.supplierID || !data.gradeID || !data.validFrom || data.enteredValue == null || !String(data.reason || '').trim()) {
        req.reject(400, 'Supplier, grade, valid-from date, entered value and reason are required.');
      }
      try { assertValidity(data.validFrom, data.validTo); } catch (error) { req.reject(400, error.message); }
      if (data.secondAmendmentDate && data.secondAmendmentDate < data.validFrom) req.reject(400, 'Second amendment date cannot precede the first amendment date.');
      if (data.thirdAmendmentDate && (!data.secondAmendmentDate || data.thirdAmendmentDate < data.secondAmendmentDate)) req.reject(400, 'Third amendment date requires and cannot precede the second amendment date.');

      const tx = cds.tx(req);
      const [supplier, grade, subGrade, prices, existing] = await Promise.all([
        tx.run(SELECT.one.from(entities.Suppliers).where({ ID: data.supplierID })),
        tx.run(SELECT.one.from(entities.RawMaterialGrades).where({ ID: data.gradeID })),
        data.subGradeID ? tx.run(SELECT.one.from(entities.RawMaterialSubGrades).where({ ID: data.subGradeID })) : null,
        tx.run(SELECT.from(entities.VendorPrices).where({ supplier_ID: data.supplierID, grade_ID: data.gradeID, status: 'EFFECTIVE' })),
        tx.run(SELECT.from(entities.PriceChangeRequests).where({ supplier_ID: data.supplierID, grade_ID: data.gradeID, status: { in: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'EFFECTIVE'] } }))
      ]);
      if (!supplier || !grade) req.reject(404, 'Supplier or RM grade not found.');
      if (subGrade && subGrade.grade_ID !== grade.ID) req.reject(400, 'The selected subgrade does not belong to the selected grade.');
      this.#assertScope(req, { plant: data.plant, purchasingOrg: data.purchasingOrg || supplier.purchasingOrg, supplierCode: supplier.code });
      const current = prices
        .filter((row) => (row.subGrade_ID || null) === (data.subGradeID || null) && row.validFrom <= data.validFrom && (!row.validTo || row.validTo >= data.validFrom))
        .sort((a, b) => String(b.validFrom).localeCompare(String(a.validFrom)))[0];
      if (!current) req.reject(409, 'No effective vendor price exists for the selected supplier, grade, subgrade and date.');
      if (existing.some((row) => (row.subGrade_ID || null) === (data.subGradeID || null) && (!row.validTo || row.validTo >= data.validFrom) && (!data.validTo || row.validFrom <= data.validTo))) {
        req.reject(409, 'An overlapping active price-change request already exists for this supplier and grade.');
      }
      const entered = decimal(data.enteredValue);
      const proposed = mode === 'DELTA' ? decimal(current.price).plus(entered) : entered;
      if (proposed.lte(0)) req.reject(400, 'The resulting proposed price must be greater than zero.');
      const ID = cds.utils.uuid();
      const requestNumber = `PCR-${new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)}-${ID.slice(0, 4).toUpperCase()}`;
      await tx.run(INSERT.into(entities.PriceChangeRequests).entries({
        ID,
        requestNumber,
        supplier_ID: supplier.ID,
        grade_ID: grade.ID,
        subGrade_ID: subGrade?.ID || null,
        purchasingOrg: data.purchasingOrg || supplier.purchasingOrg,
        plant: data.plant || null,
        oldPrice: current.price,
        proposedPrice: proposed.toFixed(6),
        inputMode: mode,
        enteredDelta: mode === 'DELTA' ? entered.toFixed(6) : proposed.minus(current.price).toFixed(6),
        priceUoM: data.priceUoM || current.priceUoM,
        priceUnit: Number(data.priceUnit || current.priceUnit || 1),
        currency: data.currency || current.currency,
        validFrom: data.validFrom,
        validTo: data.validTo || null,
        secondAmendmentDate: data.secondAmendmentDate || null,
        thirdAmendmentDate: data.thirdAmendmentDate || null,
        attachmentReference: data.attachmentReference || null,
        sourceReference: data.sourceReference || null,
        reason: String(data.reason).trim(),
        status: 'DRAFT',
        priceDocumentMode: 'AMENDMENT',
        priceDocumentStatus: 'BLOCKED',
        currentApprovalStep: 0,
        totalApprovalSteps: 1,
        version: 1
      }));
      await this.#audit(tx, entities, req, 'PRICE_CHANGE', ID, 1, 'CREATED', `Created in ${mode} mode.`, 'Buyer');
      await this.#event(tx, entities, 'INFO', 'PRICE_CHANGE', req, 'PRICE_CHANGE', ID, `${requestNumber} was created in ${mode} mode.`);
      return tx.run(SELECT.one.from(entities.PriceChangeRequests).where({ ID }));
    });

    this.on('submitPriceChange', async (req) => {
      const { priceChangeID, expectedVersion } = req.data;
      const tx = cds.tx(req);
      const record = await tx.run(SELECT.one.from(entities.PriceChangeRequests).where({ ID: priceChangeID }));
      assertVersion(req, record, expectedVersion);
      await this.#assertPriceScope(tx, entities, req, record);
      if (!['DRAFT', 'REJECTED'].includes(record.status)) req.reject(409, `A ${record.status} request cannot be submitted.`);
      if (decimal(record.proposedPrice).lte(0)) req.reject(400, 'Proposed price must be greater than zero.');

      const policies = (await tx.run(SELECT.from(entities.ApprovalPolicies).where({ objectType: 'PRICE_CHANGE', active: true }).orderBy('sequence asc')))
        .filter((policy) => (!policy.purchasingOrg || policy.purchasingOrg === record.purchasingOrg) && (!policy.currency || policy.currency === record.currency));
      if (!policies.length) req.reject(409, 'No active approval policy is configured for this price change.');

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
            currentApprovalStep: 1,
            totalApprovalSteps: policies.length,
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
      if (!String(comment || '').trim()) req.reject(400, 'An approval or rejection comment is required.');

      const tx = cds.tx(req);
      const record = await tx.run(SELECT.one.from(entities.PriceChangeRequests).where({ ID: priceChangeID }));
      assertVersion(req, record, expectedVersion);
      await this.#assertPriceScope(tx, entities, req, record);
      if (!['SUBMITTED', 'UNDER_REVIEW'].includes(record.status)) req.reject(409, `A ${record.status} request cannot be decided.`);

      const settings = toConfig(await tx.run(SELECT.from(entities.AppSettings)));
      const allowSelfApproval = Boolean(settings.ALLOW_SELF_APPROVAL_DEMO) && process.env.RMC_DEMO_MODE !== 'false';
      if (!allowSelfApproval && record.submittedBy === actor(req)) {
        req.reject(403, 'Maker-checker control prevents the submitter from approving this request.');
      }
      const policies = (await tx.run(SELECT.from(entities.ApprovalPolicies).where({ objectType: 'PRICE_CHANGE', active: true }).orderBy('sequence asc')))
        .filter((policy) => (!policy.purchasingOrg || policy.purchasingOrg === record.purchasingOrg) && (!policy.currency || policy.currency === record.currency));
      const currentStep = Math.max(1, Number(record.currentApprovalStep || 1));
      const policy = policies.find((candidate) => Number(candidate.sequence) === currentStep) || policies[currentStep - 1];
      if (!policy) req.reject(409, `No active approval policy is configured for step ${currentStep}.`);
      const demoMode = process.env.RMC_DEMO_MODE !== 'false';
      if (!demoMode && !req.user.is(policy.requiredRole)) req.reject(403, `Role ${policy.requiredRole} is required for approval step ${currentStep}.`);
      const finalApproval = normalizedDecision === 'APPROVE' && currentStep >= policies.length;
      const status = normalizedDecision === 'REJECT' ? 'REJECTED' : (finalApproval ? 'APPROVED' : 'UNDER_REVIEW');
      const nextStep = normalizedDecision === 'APPROVE' && !finalApproval ? currentStep + 1 : currentStep;
      const changed = await tx.run(
        UPDATE(entities.PriceChangeRequests)
          .set({
            status,
            currentApprovalStep: nextStep,
            totalApprovalSteps: policies.length,
            decidedAt: new Date().toISOString(),
            decidedBy: actor(req),
            decisionComment: comment || null,
            version: Number(record.version) + 1
          })
          .where({ ID: priceChangeID, version: Number(expectedVersion) })
      );
      if (!changed) req.reject(409, 'The request was changed by another user. Reload and try again.');
      await this.#audit(tx, entities, req, 'PRICE_CHANGE', priceChangeID, Number(record.version) + 1, status, comment, policy.requiredRole, currentStep);
      return tx.run(SELECT.one.from(entities.PriceChangeRequests).where({ ID: priceChangeID }));
    });

    this.on('releasePriceDocument', async (req) => {
      const { priceChangeID, expectedVersion } = req.data;
      const mode = String(req.data.mode || '').toUpperCase();
      if (!['SIMULATION', 'AMENDMENT'].includes(mode)) req.reject(400, 'Mode must be SIMULATION or AMENDMENT.');
      const tx = cds.tx(req);
      const record = await tx.run(SELECT.one.from(entities.PriceChangeRequests).where({ ID: priceChangeID }));
      assertVersion(req, record, expectedVersion);
      await this.#assertPriceScope(tx, entities, req, record);
      if (record.status !== 'APPROVED') req.reject(409, 'The revised RM price must be approved before releasing a price document.');
      if (!['BLOCKED', 'REJECTED', 'SIMULATION_ONLY'].includes(record.priceDocumentStatus || 'BLOCKED')) {
        req.reject(409, `A ${record.priceDocumentStatus} price document cannot be released again.`);
      }
      const priceDocumentStatus = mode === 'SIMULATION' ? 'SIMULATION_ONLY' : 'RELEASED_FOR_APPROVAL';
      const changed = await tx.run(
        UPDATE(entities.PriceChangeRequests)
          .set({
            priceDocumentMode: mode,
            priceDocumentStatus,
            releasedAt: new Date().toISOString(),
            releasedBy: actor(req),
            documentDecidedAt: null,
            documentDecidedBy: null,
            documentDecisionComment: null,
            version: Number(record.version) + 1
          })
          .where({ ID: priceChangeID, version: Number(expectedVersion) })
      );
      if (!changed) req.reject(409, 'The price document changed after it was loaded.');
      await this.#audit(tx, entities, req, 'PRICE_DOCUMENT', priceChangeID, Number(record.version) + 1, priceDocumentStatus, null, 'Buyer');
      return tx.run(SELECT.one.from(entities.PriceChangeRequests).where({ ID: priceChangeID }));
    });

    this.on('decidePriceDocument', async (req) => {
      const { priceChangeID, expectedVersion, decision, comment } = req.data;
      const normalized = String(decision || '').toUpperCase();
      if (!['APPROVE', 'REJECT'].includes(normalized)) req.reject(400, 'Decision must be APPROVE or REJECT.');
      if (!String(comment || '').trim()) req.reject(400, 'An approval or rejection comment is required.');
      const tx = cds.tx(req);
      const record = await tx.run(SELECT.one.from(entities.PriceChangeRequests).where({ ID: priceChangeID }));
      assertVersion(req, record, expectedVersion);
      await this.#assertPriceScope(tx, entities, req, record);
      if (record.priceDocumentStatus !== 'RELEASED_FOR_APPROVAL') {
        req.reject(409, `A ${record.priceDocumentStatus || 'BLOCKED'} price document cannot be decided.`);
      }
      const status = normalized === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      const changed = await tx.run(
        UPDATE(entities.PriceChangeRequests)
          .set({
            priceDocumentStatus: status,
            documentDecidedAt: new Date().toISOString(),
            documentDecidedBy: actor(req),
            documentDecisionComment: comment || null,
            version: Number(record.version) + 1
          })
          .where({ ID: priceChangeID, version: Number(expectedVersion) })
      );
      if (!changed) req.reject(409, 'The price document changed after it was loaded.');
      if (normalized === 'APPROVE') {
        const existingProposal = await tx.run(
          SELECT.one.from(entities.ContractPriceProposals).where({ priceChange_ID: priceChangeID })
        );
        if (!existingProposal) {
          const workbench = await this.#pricingWorkbench(tx, entities, req, priceChangeID);
          const profile = await tx.run(
            SELECT.one.from(entities.PartProfiles)
              .where({ supplier_ID: record.supplier_ID, status: 'APPROVED' })
              .orderBy('version desc')
          );
          if (!profile?.contractItem_ID) req.reject(409, 'An approved contract-linked part profile is required for the contract-price handoff.');
          const proposalID = cds.utils.uuid();
          await tx.run(INSERT.into(entities.ContractPriceProposals).entries({
            ID: proposalID,
            proposalNumber: `CPP-${record.requestNumber}-${proposalID.slice(0, 4).toUpperCase()}`,
            priceChange_ID: priceChangeID,
            contractItem_ID: profile.contractItem_ID,
            oldPrice: workbench.summary.currentPoPrice,
            proposedPrice: workbench.summary.revisedPoPrice,
            currency: workbench.summary.currency,
            priceUnit: 1,
            validFrom: record.validFrom,
            validTo: record.validTo,
            status: 'APPROVED',
            s4WorkflowStatus: 'DEMO_HANDOFF_READY',
            version: 1
          }));
        }
      }
      await this.#audit(tx, entities, req, 'PRICE_DOCUMENT', priceChangeID, Number(record.version) + 1, status, comment, 'CompositionApprover');
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

    this.on('rerunCalculation', async (req) => {
      const { runID, expectedVersion, priority = 100 } = req.data;
      const reason = String(req.data.reason || '').trim();
      if (!reason) req.reject(400, 'A rerun reason is required.');
      const tx = cds.tx(req);
      const original = await tx.run(SELECT.one.from(entities.CalculationRuns).where({ ID: runID }));
      assertVersion(req, original, expectedVersion);
      if (['QUEUED', 'RUNNING'].includes(original.status)) req.reject(409, `A ${original.status} calculation cannot be rerun.`);
      const activeRerun = await tx.run(SELECT.one.from(entities.CalculationRuns).where({
        rerunOf_ID: original.ID,
        status: { in: ['QUEUED', 'RUNNING'] }
      }));
      if (activeRerun) req.reject(409, `Rerun ${activeRerun.runNumber} is already active.`);
      const priceChange = await tx.run(SELECT.one.from(entities.PriceChangeRequests).where({ ID: original.priceChange_ID }));
      if (!priceChange || priceChange.status !== 'APPROVED') req.reject(409, 'The source price change must remain approved for a rerun.');
      await this.#assertPriceScope(tx, entities, req, priceChange);
      const ID = cds.utils.uuid();
      const now = new Date();
      const runNumber = `RER-${now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)}-${ID.slice(0, 6).toUpperCase()}`;
      await tx.run(INSERT.into(entities.CalculationRuns).entries({
        ID,
        runNumber,
        rerunOf_ID: original.ID,
        rerunReason: reason,
        priceChange_ID: original.priceChange_ID,
        periodFrom: original.periodFrom,
        periodTo: original.periodTo,
        cutoffAt: now.toISOString(),
        status: 'QUEUED',
        priority: Math.max(1, Math.min(999, Number(priority || original.priority || 100))),
        requestedBy: actor(req),
        currency: original.currency,
        configSnapshot: original.configSnapshot,
        version: 1
      }));
      await this.#audit(tx, entities, req, 'CALCULATION_RUN', ID, 1, 'RERUN_QUEUED', reason, 'Buyer');
      await this.#event(tx, entities, 'INFO', 'CALCULATION', req, 'CALCULATION_RUN', ID, `${runNumber} was queued as a rerun of ${original.runNumber}.`);
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

    this.on('reverseSimulatedPosting', async (req) => {
      const reason = String(req.data.reason || '').trim();
      if (!reason) req.reject(400, 'A reversal reason is required.');
      const tx = cds.tx(req);
      const posting = await tx.run(SELECT.one.from(entities.PostingRecords).where({ ID: req.data.postingID }));
      if (!posting) req.reject(404, 'Posting simulation not found.');
      if (!posting.simulated || posting.status !== 'SIMULATED') req.reject(409, 'Only an unreversed simulated posting can be reversed here.');
      const existing = await tx.run(SELECT.one.from(entities.PostingRecords).where({ reversalOf: posting.ID }));
      if (existing) return existing;
      const result = await postingAdapter.reverseSimulation({ posting, user: actor(req), reason });
      const replay = await tx.run(SELECT.one.from(entities.PostingRecords).where({ idempotencyKey: result.idempotencyKey }));
      if (replay) return replay;
      const ID = cds.utils.uuid();
      await tx.run(INSERT.into(entities.PostingRecords).entries({
        ID,
        objectType: posting.objectType,
        objectID: posting.objectID,
        ...result
      }));
      await this.#audit(tx, entities, req, 'POSTING_REVERSAL', ID, 1, 'REVERSED', reason, 'RmcFinance');
      await this.#event(tx, entities, 'INFO', 'POSTING', req, posting.objectType, posting.objectID, result.message);
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

  async #pricingWorkbench(tx, entities, req, priceChangeID) {
    const priceChange = await tx.run(
      SELECT.one.from(entities.PriceChangeRequests).where({ ID: priceChangeID })
    );
    if (!priceChange) req.reject(404, 'Price change request not found.');

    const supplier = await tx.run(
      SELECT.one.from(entities.Suppliers).where({ ID: priceChange.supplier_ID })
    );
    const profiles = await tx.run(
      SELECT.from(entities.PartProfiles)
        .where({ supplier_ID: priceChange.supplier_ID, status: 'APPROVED' })
        .orderBy('version desc')
    );
    const profile = profiles.find(
      (candidate) => candidate.validFrom <= priceChange.validFrom && (!candidate.validTo || candidate.validTo >= priceChange.validFrom)
    );
    if (!profile) req.reject(409, 'No approved supplier part profile is effective for this price change.');

    const [material, contractItem, constituents] = await Promise.all([
      tx.run(SELECT.one.from(entities.Materials).where({ ID: profile.material_ID })),
      tx.run(SELECT.one.from(entities.ContractItems).where({ ID: profile.contractItem_ID })),
      tx.run(SELECT.from(entities.PartConstituents).where({ profile_ID: profile.ID }).orderBy('createdAt asc'))
    ]);
    if (!contractItem) req.reject(409, 'The approved part profile is not linked to a contract item.');

    const gradeIds = [...new Set(constituents.map((row) => row.grade_ID))];
    const subGradeIds = [...new Set(constituents.map((row) => row.subGrade_ID).filter(Boolean))];
    const bomItemIds = [...new Set(constituents.map((row) => row.bomItem_ID).filter(Boolean))];
    const [contract, grades, subGrades, bomItems, vendorPrices, movementRules, receipts] = await Promise.all([
      tx.run(SELECT.one.from(entities.Contracts).where({ ID: contractItem.contract_ID })),
      gradeIds.length ? tx.run(SELECT.from(entities.RawMaterialGrades).where({ ID: { in: gradeIds } })) : [],
      subGradeIds.length ? tx.run(SELECT.from(entities.RawMaterialSubGrades).where({ ID: { in: subGradeIds } })) : [],
      bomItemIds.length ? tx.run(SELECT.from(entities.BomItems).where({ ID: { in: bomItemIds } })) : [],
      tx.run(SELECT.from(entities.VendorPrices).where({ supplier_ID: priceChange.supplier_ID })),
      tx.run(SELECT.from(entities.MovementTypeRules)),
      tx.run(
        SELECT.from(entities.GoodsReceipts).where({
          supplier_ID: priceChange.supplier_ID,
          material_ID: profile.material_ID,
          postingDate: { between: priceChange.validFrom, and: priceChange.validTo || priceChange.validFrom }
        })
      )
    ]);

    const movementMap = new Map(movementRules.map((rule) => [rule.movementType, rule]));
    let eligibleReceiptCount = 0;
    const eligibleQuantity = receipts.reduce((total, receipt) => {
      const rule = movementMap.get(receipt.movementType);
      if (!rule?.eligible || (rule.requiresReference && !receipt.reversalOf)) return total;
      eligibleReceiptCount += 1;
      return total.plus(decimal(receipt.quantity).times(rule.quantitySign));
    }, decimal(0));

    return buildPricingWorkbench({
      priceChange,
      supplier,
      profile,
      material,
      contractItem,
      contract,
      constituents,
      grades,
      subGrades,
      bomItems,
      vendorPrices,
      eligibleQuantity,
      eligibleReceiptCount
    });
  }

  async #createRequestedMaster(tx, entities, req, record) {
    const now = new Date().toISOString();
    const ID = cds.utils.uuid();
    if (record.requestType === 'TYPE') {
      if (!record.commodity_ID || !record.defaultPriceUoM || !record.defaultCurrency) {
        req.reject(400, 'Commodity, default price UoM and currency are required for an RM type.');
      }
      const duplicate = await tx.run(SELECT.one.from(entities.RawMaterialTypes).where({ code: record.proposedCode }));
      if (duplicate) req.reject(409, `RM type ${record.proposedCode} already exists.`);
      await tx.run(INSERT.into(entities.RawMaterialTypes).entries({
        ID,
        code: record.proposedCode,
        name: record.proposedName,
        commodity_ID: record.commodity_ID,
        defaultPriceUoM: record.defaultPriceUoM,
        defaultCurrency: record.defaultCurrency,
        owner: 'RM Admin',
        validFrom: record.validFrom,
        validTo: record.validTo,
        status: 'ACTIVE',
        markedForDeletion: false,
        approvedAt: now,
        approvedBy: actor(req),
        version: 1
      }));
    } else if (record.requestType === 'GRADE') {
      if (!record.rawMaterialType_ID) req.reject(400, 'Parent RM type is required for a grade.');
      const duplicate = await tx.run(SELECT.one.from(entities.RawMaterialGrades).where({ rawMaterialType_ID: record.rawMaterialType_ID, code: record.proposedCode }));
      if (duplicate) req.reject(409, `RM grade ${record.proposedCode} already exists for this type.`);
      await tx.run(INSERT.into(entities.RawMaterialGrades).entries({
        ID,
        rawMaterialType_ID: record.rawMaterialType_ID,
        code: record.proposedCode,
        name: record.proposedName,
        specification: record.specification,
        defaultYieldFactor: 1,
        validFrom: record.validFrom,
        validTo: record.validTo,
        status: 'ACTIVE',
        markedForDeletion: false,
        approvedAt: now,
        approvedBy: actor(req),
        version: 1
      }));
    } else {
      if (!record.grade_ID) req.reject(400, 'Parent RM grade is required for a subgrade.');
      const duplicate = await tx.run(SELECT.one.from(entities.RawMaterialSubGrades).where({ grade_ID: record.grade_ID, code: record.proposedCode }));
      if (duplicate) req.reject(409, `RM subgrade ${record.proposedCode} already exists for this grade.`);
      await tx.run(INSERT.into(entities.RawMaterialSubGrades).entries({
        ID,
        grade_ID: record.grade_ID,
        code: record.proposedCode,
        name: record.proposedName,
        specification: record.specification,
        classification: record.classification,
        validFrom: record.validFrom,
        validTo: record.validTo,
        status: 'ACTIVE',
        markedForDeletion: false,
        approvedAt: now,
        approvedBy: actor(req),
        version: 1
      }));
    }
    return ID;
  }

  #assertScope(req, target) {
    if (process.env.RMC_DEMO_MODE !== 'false') return;
    if (!isInOrganizationalScope(req.user, target)) {
      req.reject(403, 'The user is outside the required company, purchasing organization, plant or supplier scope.');
    }
  }

  async #assertPriceScope(tx, entities, req, record) {
    const supplier = await tx.run(SELECT.one.from(entities.Suppliers).where({ ID: record.supplier_ID }));
    this.#assertScope(req, {
      companyCode: supplier?.companyCode,
      purchasingOrg: record.purchasingOrg || supplier?.purchasingOrg,
      plant: record.plant,
      supplierCode: supplier?.code
    });
  }

  async #validateContract(tx, entities, req, contractItemID, supplierID, materialID, plant, businessDate) {
    if (!contractItemID) req.reject(400, 'A contract item is required.');
    const item = await tx.run(SELECT.one.from(entities.ContractItems).where({ ID: contractItemID }));
    if (!item || item.material_ID !== materialID || item.plant !== plant || item.status !== 'ACTIVE') {
      req.reject(400, 'The contract item is not active for the selected material and plant.');
    }
    const contract = await tx.run(SELECT.one.from(entities.Contracts).where({ ID: item.contract_ID }));
    if (!contract || contract.supplier_ID !== supplierID || contract.releaseStatus !== 'RELEASED' || contract.validFrom > businessDate || contract.validTo < businessDate) {
      req.reject(400, 'The contract is not released and valid for the selected supplier and business date.');
    }
    return item;
  }

  async #bomHierarchy(tx, entities, req, materialID, plant, keyDate) {
    if (!materialID || !plant || !keyDate) req.reject(400, 'Material, plant and key date are required for BOM explosion.');
    const [headers, items, materials] = await Promise.all([
      tx.run(SELECT.from(entities.BomHeaders)),
      tx.run(SELECT.from(entities.BomItems)),
      tx.run(SELECT.from(entities.Materials))
    ]);
    try {
      return explodeBom({ rootMaterialID: materialID, plant, keyDate, headers, items, materials });
    } catch (error) {
      req.reject(400, error.message);
    }
  }

  async #createFinding(tx, entities, objectType, objectID, code, mandatory, message) {
    const existing = await tx.run(SELECT.one.from(entities.WorkflowExceptions).where({ objectType, objectID, code, status: 'OPEN' }));
    if (existing) return existing;
    const ID = cds.utils.uuid();
    await tx.run(INSERT.into(entities.WorkflowExceptions).entries({
      ID, objectType, objectID, code, severity: mandatory ? 'ERROR' : 'WARNING', mandatory,
      status: 'OPEN', message, version: 1
    }));
    return tx.run(SELECT.one.from(entities.WorkflowExceptions).where({ ID }));
  }

  async #closeFindings(tx, entities, objectType, objectID, code, resolvedBy, resolution) {
    const rows = await tx.run(SELECT.from(entities.WorkflowExceptions).where({ objectType, objectID, code, status: 'OPEN' }));
    for (const row of rows) {
      await tx.run(UPDATE(entities.WorkflowExceptions).set({
        status: 'RESOLVED', resolution, resolvedBy, resolvedAt: new Date().toISOString(), version: Number(row.version) + 1
      }).where({ ID: row.ID, version: Number(row.version) }));
    }
  }

  async #refreshCompositionFindings(tx, entities, req, profileID) {
    const profile = await tx.run(SELECT.one.from(entities.PartProfiles).where({ ID: profileID }));
    if (!profile) req.reject(404, 'Composition profile not found.');
    const material = await tx.run(SELECT.one.from(entities.Materials).where({ ID: profile.material_ID }));
    const [nodes, constituents, existing] = await Promise.all([
      this.#bomHierarchy(tx, entities, req, profile.material_ID, material.plant, profile.validFrom),
      tx.run(SELECT.from(entities.PartConstituents).where({ profile_ID: profile.ID })),
      tx.run(SELECT.from(entities.WorkflowExceptions).where({ objectType: 'COMPOSITION', objectID: profile.ID }))
    ]);
    const assessment = assessComposition(nodes, constituents);
    if (profile.contractExceptionRequired && profile.contractExceptionStatus !== 'APPROVED') {
      assessment.findings.push({ code: 'CONTRACT_EXCEPTION_PENDING', mandatory: true, message: 'No-contract exception approval is required.' });
    }
    const currentCodes = new Set(assessment.findings.map((finding) => finding.code));
    for (const finding of assessment.findings) {
      const row = existing.find((candidate) => candidate.code === finding.code);
      if (!row) {
        await this.#createFinding(tx, entities, 'COMPOSITION', profile.ID, finding.code, finding.mandatory, finding.message);
      } else if (row.status !== 'OPEN' && !(row.status === 'EXCLUDED' && !finding.mandatory)) {
        await tx.run(UPDATE(entities.WorkflowExceptions).set({
          status: 'OPEN', message: finding.message, resolution: null, resolvedBy: null, resolvedAt: null, version: Number(row.version) + 1
        }).where({ ID: row.ID, version: Number(row.version) }));
      }
    }
    for (const row of existing.filter((candidate) => candidate.status === 'OPEN' && !currentCodes.has(candidate.code))) {
      await tx.run(UPDATE(entities.WorkflowExceptions).set({
        status: 'RESOLVED', resolution: 'Resolved by corrected composition data.', resolvedBy: actor(req), resolvedAt: new Date().toISOString(), version: Number(row.version) + 1
      }).where({ ID: row.ID, version: Number(row.version) }));
    }
    await tx.run(UPDATE(entities.PartProfiles).set({ completenessPct: assessment.completenessPct }).where({ ID: profile.ID }));
    return assessment;
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

  async #audit(tx, entities, req, objectType, objectID, objectVersion, decision, comment, actorRole, step = 1) {
    await tx.run(
      INSERT.into(entities.ApprovalRecords).entries({
        ID: cds.utils.uuid(),
        objectType,
        objectID,
        objectVersion,
        step,
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
