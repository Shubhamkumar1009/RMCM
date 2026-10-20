using { rmc as db } from '../db/schema';

@path: '/odata/v4/rmc'
@requires: 'authenticated-user'
service RmcService {
  @readonly entity Suppliers                  as projection on db.Suppliers;
  @readonly entity Materials                  as projection on db.Materials;
  @readonly entity Contracts                  as projection on db.Contracts;
  @readonly entity ContractItems              as projection on db.ContractItems;
  @readonly entity RawMaterialTypes           as projection on db.RawMaterialTypes;
  @readonly entity RawMaterialGrades          as projection on db.RawMaterialGrades;
  @readonly entity BomHeaders                 as projection on db.BomHeaders;
  @readonly entity BomItems                   as projection on db.BomItems;
  entity PartProfiles                         as projection on db.PartProfiles;
  entity PartConstituents                     as projection on db.PartConstituents;
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

  action getDashboard() returns DashboardSummary;
  action submitPriceChange(priceChangeID : UUID, expectedVersion : Integer) returns PriceChangeRequests;
  action decidePriceChange(priceChangeID : UUID, expectedVersion : Integer, decision : String(10), comment : String(500)) returns PriceChangeRequests;
  action queueCalculation(priceChangeID : UUID, periodFrom : Date, periodTo : Date, priority : Integer) returns CalculationRuns;
  action decideCalculation(runID : UUID, expectedVersion : Integer, decision : String(10), comment : String(500)) returns CalculationRuns;
  action simulatePosting(runID : UUID) returns PostingRecords;
  action createContractProposal(runID : UUID, contractItemID : UUID, validFrom : Date) returns ContractPriceProposals;
}

