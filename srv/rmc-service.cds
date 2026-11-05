using { rmc as db } from '../db/schema';

@path: '/odata/v4/rmc'
@requires: 'authenticated-user'
service RmcService {
  @readonly entity Suppliers                  as projection on db.Suppliers;
  @readonly entity Materials                  as projection on db.Materials;
  @readonly entity Contracts                  as projection on db.Contracts;
  @readonly entity ContractItems              as projection on db.ContractItems;
  @readonly entity Commodities                as projection on db.Commodities;
  @readonly entity RawMaterialTypes           as projection on db.RawMaterialTypes;
  @readonly entity RawMaterialGrades          as projection on db.RawMaterialGrades;
  @readonly entity RawMaterialSubGrades       as projection on db.RawMaterialSubGrades;
  entity RawMaterialMasterRequests            as projection on db.RawMaterialMasterRequests;
  @readonly entity BomHeaders                 as projection on db.BomHeaders;
  @readonly entity BomItems                   as projection on db.BomItems;
  @readonly entity PartProfiles               as projection on db.PartProfiles;
  @readonly entity PartConstituents           as projection on db.PartConstituents;
  @readonly entity VendorPartLinkages         as projection on db.VendorPartLinkages;
  @readonly entity WorkflowExceptions         as projection on db.WorkflowExceptions;
  @readonly entity ReconciliationRecords      as projection on db.ReconciliationRecords;
  @readonly entity VendorPrices               as projection on db.VendorPrices;
  @readonly entity PriceRuleTemplates         as projection on db.PriceRuleTemplates;
  entity PriceChangeRequests                  as projection on db.PriceChangeRequests;
  @readonly entity ApprovalRecords            as projection on db.ApprovalRecords;
  @readonly entity GoodsReceipts              as projection on db.GoodsReceipts;
  @readonly entity CalculationRuns            as projection on db.CalculationRuns;
  @readonly entity CalculationLines           as projection on db.CalculationLines;
  @readonly entity ContractPriceProposals     as projection on db.ContractPriceProposals;
  @readonly entity PostingRecords             as projection on db.PostingRecords;
  @readonly entity AppSettings                as projection on db.AppSettings;
  @readonly entity MovementTypeRules          as projection on db.MovementTypeRules;
  @readonly entity SystemEvents               as projection on db.SystemEvents;

  type DashboardSummary {
    draftPriceChanges      : Integer;
    pendingApprovals       : Integer;
    queuedRuns             : Integer;
    runningRuns            : Integer;
    completedRuns          : Integer;
    failedRuns             : Integer;
    approvedNotPosted      : Integer;
    totalExposure          : Decimal(23,6);
    currency               : String(3);
    demoMode               : Boolean;
  }

  type PricingWorkbenchSummary {
    documentType           : String(30);
    requestNumber          : String(30);
    referenceNumber        : String(200);
    priceReason            : String(30);
    direction              : String(20);
    backToBack             : Boolean;
    supplierCode           : String(20);
    supplierName           : String(120);
    companyCode            : String(4);
    purchasingOrg          : String(8);
    purchasingGroup        : String(3);
    plant                  : String(4);
    partCode               : String(40);
    partDescription        : String(120);
    contractNumber         : String(20);
    contractItem           : String(5);
    validFrom              : Date;
    validTo                : Date;
    currency               : String(3);
    status                 : String(30);
    releaseStatus          : String(30);
    priceDocumentMode      : String(30);
    priceDocumentStatus    : String(30);
    currentPoPrice         : Decimal(23,6);
    revisedPoPrice         : Decimal(23,6);
    unitDelta              : Decimal(23,6);
    priceChangePct         : Decimal(9,2);
    eligibleQuantity       : Decimal(23,9);
    estimatedImpact        : Decimal(23,6);
    affectedParts          : Integer;
    affectedGrades         : Integer;
    affectedVendors        : Integer;
    affectedPlants         : Integer;
    affectedContracts      : Integer;
    grnCount               : Integer;
    calculationTrace       : String(1000);
  }

  type CostSheetLine {
    partCode               : String(40);
    partDescription        : String(120);
    gradeCode              : String(30);
    gradeName              : String(100);
    subGradeCode           : String(30);
    subGradeName           : String(100);
    scrapCode              : String(40);
    inputWeight            : Decimal(23,9);
    outputWeight           : Decimal(23,9);
    scrapWeight            : Decimal(23,9);
    uoM                    : String(3);
    currentRmPrice         : Decimal(23,6);
    revisedRmPrice         : Decimal(23,6);
    currentScrapPrice      : Decimal(23,6);
    revisedScrapPrice      : Decimal(23,6);
    currentRmCost          : Decimal(23,6);
    revisedRmCost          : Decimal(23,6);
    currentScrapCredit     : Decimal(23,6);
    revisedScrapCredit     : Decimal(23,6);
    currentContribution    : Decimal(23,6);
    revisedContribution    : Decimal(23,6);
    rmRateDelta            : Decimal(23,6);
    scrapRateDelta         : Decimal(23,6);
    adjustmentPct          : Decimal(9,6);
    totalDelta             : Decimal(23,6);
    currency               : String(3);
    changed                : Boolean;
    explanation            : String(1000);
  }

  type ImpactBreakdown {
    code                   : String(30);
    label                  : String(100);
    currentValue           : Decimal(23,6);
    proposedValue          : Decimal(23,6);
    delta                  : Decimal(23,6);
    currency               : String(3);
  }

  type ImpactedPart {
    supplierCode           : String(20);
    supplierName           : String(120);
    partCode               : String(40);
    partDescription        : String(120);
    plant                  : String(4);
    revisionLevel          : String(20);
    contractNumber         : String(20);
    contractItem           : String(5);
    contractStatus         : String(30);
    gradeCode              : String(30);
    subGradeCode           : String(30);
    currentPrice           : Decimal(23,6);
    revisedPrice           : Decimal(23,6);
    currency               : String(3);
    validFrom              : Date;
    validTo                : Date;
    readiness              : String(30);
  }

  type ContractSearchResult {
    contractItemID         : UUID;
    contractNumber         : String(20);
    itemNumber             : String(5);
    supplierCode           : String(20);
    materialCode           : String(40);
    plant                  : String(4);
    purchasingOrg          : String(8);
    companyCode            : String(4);
    validFrom              : Date;
    validTo                : Date;
    currency               : String(3);
    currentPrice           : Decimal(23,6);
    priceUnit              : Integer;
    orderPriceUnit         : String(3);
  }

  type BomHierarchyNode {
    bomItemID              : UUID;
    materialID             : UUID;
    parentMaterialID       : UUID;
    materialCode           : String(40);
    materialDescription    : String(120);
    itemNumber             : String(6);
    hierarchyDepth         : Integer;
    lineagePath            : String(500);
    leafPart               : Boolean;
    quantity               : Decimal(23,9);
    uoM                    : String(3);
  }

  type LegacyControl {
    controlId              : String(20);
    area                   : String(60);
    legacyRisk             : String(500);
    safeguard              : String(500);
    implementationStatus   : String(30);
    evidence               : String(300);
  }

  action getDashboard() returns DashboardSummary;
  action getPricingWorkbench(priceChangeID : UUID) returns PricingWorkbenchSummary;
  action getCostSheet(priceChangeID : UUID) returns many CostSheetLine;
  action getImpactBreakdown(priceChangeID : UUID) returns many ImpactBreakdown;
  action getImpactedParts(priceChangeID : UUID) returns many ImpactedPart;
  action getLegacyControlMatrix() returns many LegacyControl;
  @requires: 'CommodityAdmin'
  action createCommodity(code : String(20), name : String(100), description : String(500), validFrom : Date, validTo : Date) returns Commodities;
  @requires: 'CommodityAdmin'
  action closeCommodityValidity(commodityID : UUID, expectedVersion : Integer, validTo : Date) returns Commodities;
  @requires: 'CommodityAdmin'
  action setCommodityDeletionMarker(commodityID : UUID, expectedVersion : Integer, markedForDeletion : Boolean) returns Commodities;
  @requires: 'Buyer'
  action searchValidContractItems(supplierID : UUID, materialID : UUID, plant : String(4), businessDate : Date) returns many ContractSearchResult;
  @requires: 'Buyer'
  action createVendorPartLinkage(supplierID : UUID, materialID : UUID, plant : String(4), purchasingOrg : String(8), contractItemID : UUID, revisionLevel : String(20), validFrom : Date, validTo : Date, missingContractReason : String(500), linkageType : String(20), partType : String(20), indexingFrequency : String(20), initialSettledRate : Decimal(23,6), initialRateCurrency : String(3), preliminaryExposure : Boolean, sourceReference : String(100)) returns VendorPartLinkages;
  @requires: 'CompositionApprover'
  action decideContractException(linkageID : UUID, expectedVersion : Integer, decision : String(10), comment : String(500)) returns VendorPartLinkages;
  @requires: 'Buyer'
  action allocateContract(linkageID : UUID, expectedVersion : Integer, contractItemID : UUID, businessDate : Date) returns VendorPartLinkages;
  action getBomHierarchy(materialID : UUID, plant : String(4), keyDate : Date) returns many BomHierarchyNode;
  @requires: 'Buyer'
  action createCompositionRevision(linkageID : UUID, expectedVersion : Integer, bomHeaderID : UUID, validFrom : Date, validTo : Date) returns PartProfiles;
  @requires: 'Buyer'
  action mapCompositionLeaf(profileID : UUID, expectedVersion : Integer, bomItemID : UUID, gradeID : UUID, subGradeID : UUID, inputWeight : Decimal(23,9), outputWeight : Decimal(23,9), scrapWeight : Decimal(23,9), uoM : String(3), overrideReason : String(500), minimumThickness : Decimal(23,9), maximumThickness : Decimal(23,9), tubeOutsideDiameter : Decimal(23,9), length : Decimal(23,9), width : Decimal(23,9), numberOfBlanks : Decimal(23,9), plmWeight : Decimal(23,9), finishWeight : Decimal(23,9), forgeCastWeight : Decimal(23,9), offcutWeight : Decimal(23,9), offcutPct : Decimal(9,6), scrapYieldPct : Decimal(9,6), surfaceArea : Decimal(23,9), surfaceAreaUoM : String(3), surfaceProcess : String(60), surfaceProtectionCost : Decimal(23,6), boughtOutCost : Decimal(23,6), packagingTermsCost : Decimal(23,6), polypropyleneContent : Decimal(23,9), talcPct : Decimal(9,6), impactModifier : Decimal(12,9)) returns PartProfiles;
  @requires: 'Buyer'
  action submitComposition(profileID : UUID, expectedVersion : Integer) returns PartProfiles;
  @requires: 'CompositionApprover'
  action decideComposition(profileID : UUID, expectedVersion : Integer, decision : String(10), comment : String(500)) returns PartProfiles;
  @requires: 'CompositionApprover'
  action resolveWorkflowException(exceptionID : UUID, expectedVersion : Integer, resolution : String(1000), exclude : Boolean) returns WorkflowExceptions;
  @requires: 'RmcAuditor'
  action reconcilePriceChange(priceChangeID : UUID) returns ReconciliationRecords;
  @requires: 'Buyer'
  action submitRmMasterRequest(requestID : UUID, expectedVersion : Integer) returns RawMaterialMasterRequests;
  @requires: 'RmAdmin'
  action decideRmMasterRequest(requestID : UUID, expectedVersion : Integer, decision : String(10), comment : String(500)) returns RawMaterialMasterRequests;
  @requires: 'Buyer'
  action createPriceChange(supplierID : UUID, gradeID : UUID, subGradeID : UUID, purchasingOrg : String(8), plant : String(4), inputMode : String(20), enteredValue : Decimal(23,6), priceUoM : String(3), priceUnit : Integer, currency : String(3), validFrom : Date, validTo : Date, reason : String(500), sourceReference : String(200), secondAmendmentDate : Date, thirdAmendmentDate : Date, attachmentReference : String(500)) returns PriceChangeRequests;
  @requires: 'Buyer'
  action submitPriceChange(priceChangeID : UUID, expectedVersion : Integer) returns PriceChangeRequests;
  @requires: 'RmcApprover'
  action decidePriceChange(priceChangeID : UUID, expectedVersion : Integer, decision : String(10), comment : String(500)) returns PriceChangeRequests;
  @requires: 'Buyer'
  action releasePriceDocument(priceChangeID : UUID, expectedVersion : Integer, mode : String(20)) returns PriceChangeRequests;
  @requires: 'CompositionApprover'
  action decidePriceDocument(priceChangeID : UUID, expectedVersion : Integer, decision : String(10), comment : String(500)) returns PriceChangeRequests;
  @requires: 'Buyer'
  action queueCalculation(priceChangeID : UUID, periodFrom : Date, periodTo : Date, priority : Integer) returns CalculationRuns;
  @requires: 'Buyer'
  action rerunCalculation(runID : UUID, expectedVersion : Integer, reason : String(500), priority : Integer) returns CalculationRuns;
  @requires: 'RmcApprover'
  action decideCalculation(runID : UUID, expectedVersion : Integer, decision : String(10), comment : String(500)) returns CalculationRuns;
  @requires: 'RmcFinance'
  action simulatePosting(runID : UUID) returns PostingRecords;
  @requires: 'RmcFinance'
  action reverseSimulatedPosting(postingID : UUID, reason : String(500)) returns PostingRecords;
  action createContractProposal(runID : UUID, contractItemID : UUID, validFrom : Date) returns ContractPriceProposals;
}

