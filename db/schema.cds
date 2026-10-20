namespace rmc;

using { cuid, managed } from '@sap/cds/common';

type LifecycleStatus : String(20) enum {
  ACTIVE;
  INACTIVE;
  BLOCKED;
}

type RequestStatus : String(30) enum {
  DRAFT;
  SUBMITTED;
  UNDER_REVIEW;
  APPROVED;
  REJECTED;
  CANCELLED;
  EFFECTIVE;
  SUPERSEDED;
}

type RunStatus : String(30) enum {
  QUEUED;
  RUNNING;
  COMPLETED;
  FAILED;
  APPROVED;
  REJECTED;
  POSTED;
  REVERSED;
}

type PostingStatus : String(30) enum {
  SIMULATED;
  PENDING;
  SENT;
  POSTED;
  FAILED;
  REVERSED;
}

aspect Versioned {
  version : Integer not null default 1;
}

@assert.unique.code: [code]
entity Suppliers : cuid, managed, Versioned {
  code                 : String(20) not null;
  name                 : String(120) not null;
  businessPartner      : String(20);
  purchasingOrg        : String(8);
  companyCode          : String(4);
  country              : String(3);
  status               : LifecycleStatus default #ACTIVE;
}

@assert.unique.code: [code]
entity Materials : cuid, managed, Versioned {
  code                 : String(40) not null;
  description          : String(120) not null;
  plant                : String(4) not null;
  materialType         : String(4);
  baseUoM              : String(3) not null;
  status               : LifecycleStatus default #ACTIVE;
}

@assert.unique.contractNumber: [contractNumber]
entity Contracts : cuid, managed, Versioned {
  contractNumber       : String(20) not null;
  supplier             : Association to Suppliers not null;
  companyCode          : String(4) not null;
  purchasingOrg        : String(8) not null;
  purchasingGroup      : String(3);
  validFrom             : Date not null;
  validTo               : Date not null;
  currency             : String(3) not null;
  releaseStatus        : String(20) default 'RELEASED';
  sourceSystem          : String(20) default 'S4_DEMO';
}

@assert.unique.contractItem: [contract, itemNumber]
entity ContractItems : cuid, managed, Versioned {
  contract             : Association to Contracts not null;
  itemNumber           : String(5) not null;
  material             : Association to Materials not null;
  plant                : String(4) not null;
  orderPriceUnit       : String(3) not null;
  priceUnit            : Integer not null default 1;
  currentPrice         : Decimal(23,6) not null;
  targetQuantity       : Decimal(23,6);
  status               : LifecycleStatus default #ACTIVE;
}

@assert.unique.typeCode: [code]
entity RawMaterialTypes : cuid, managed, Versioned {
  code                 : String(20) not null;
  name                 : String(100) not null;
  commodityCategory    : String(40);
  defaultPriceUoM      : String(3) not null;
  defaultCurrency      : String(3) not null;
  owner                : String(80);
  status               : LifecycleStatus default #ACTIVE;
}

@assert.unique.gradeCode: [rawMaterialType, code]
entity RawMaterialGrades : cuid, managed, Versioned {
  rawMaterialType      : Association to RawMaterialTypes not null;
  code                 : String(30) not null;
  name                 : String(100) not null;
  specification        : LargeString;
  purityPct            : Decimal(9,6);
  defaultYieldFactor   : Decimal(12,9) default 1;
  priceIndexCode       : String(30);
  status               : LifecycleStatus default #ACTIVE;
}

entity BomHeaders : cuid, managed, Versioned {
  material             : Association to Materials not null;
  plant                : String(4) not null;
  usage                : String(2) not null default '1';
  alternative          : String(2) not null default '01';
  baseQuantity         : Decimal(23,9) not null default 1;
  baseUoM              : String(3) not null;
  validFrom             : Date not null;
  validTo               : Date;
  changeNumber         : String(20);
  sourceSystem          : String(20) default 'S4_DEMO';
}

entity BomItems : cuid, managed, Versioned {
  header               : Association to BomHeaders not null;
  itemNumber           : String(6) not null;
  component            : Association to Materials;
  componentDescription : String(120);
  itemCategory         : String(2) default 'L';
  componentQuantity    : Decimal(23,9) not null;
  componentUoM         : String(3) not null;
  componentScrapPct    : Decimal(9,6) default 0;
  fixedQuantity        : Boolean default false;
  phantom              : Boolean default false;
  relevantToRmc        : Boolean default true;
}

entity PartProfiles : cuid, managed, Versioned {
  material             : Association to Materials not null;
  supplier             : Association to Suppliers;
  contractItem         : Association to ContractItems;
  bomHeader            : Association to BomHeaders;
  validFrom             : Date not null;
  validTo               : Date;
  status               : RequestStatus default #DRAFT;
  completenessPct      : Decimal(5,2) default 0;
  totalRmContent       : Decimal(23,9) default 0;
  normalizedUoM        : String(3);
  snapshotHash         : String(64);
  approvedAt           : Timestamp;
  approvedBy           : String(100);
}

entity PartConstituents : cuid, managed, Versioned {
  profile              : Association to PartProfiles not null;
  bomItem              : Association to BomItems;
  grade                : Association to RawMaterialGrades not null;
  contentQuantity      : Decimal(23,9) not null;
  contentUoM           : String(3) not null;
  contentPct           : Decimal(9,6);
  yieldFactor          : Decimal(12,9) default 1;
  scrapFactor          : Decimal(12,9) default 1;
  source               : String(20) default 'BOM';
  overrideReason       : String(500);
}

entity VendorPrices : cuid, managed, Versioned {
  supplier             : Association to Suppliers not null;
  grade                : Association to RawMaterialGrades not null;
  purchasingOrg        : String(8);
  plant                : String(4);
  price                : Decimal(23,6) not null;
  priceUoM             : String(3) not null;
  priceUnit            : Integer not null default 1;
  currency             : String(3) not null;
  validFrom             : Date not null;
  validTo               : Date;
  status               : RequestStatus default #EFFECTIVE;
  sourceReference      : String(100);
}

entity PriceRuleTemplates : cuid, managed, Versioned {
  code                 : String(30) not null;
  name                 : String(100) not null;
  method               : String(20) not null default 'DIRECT';
  observationDays      : Integer default 0;
  lagDays              : Integer default 0;
  premium              : Decimal(23,6) default 0;
  floorValue           : Decimal(23,6);
  ceilingValue         : Decimal(23,6);
  noChangeThresholdPct : Decimal(9,6) default 0;
  roundingScale        : Integer default 2;
  active               : Boolean default true;
}

entity PriceChangeRequests : cuid, managed, Versioned {
  requestNumber        : String(30) not null;
  supplier             : Association to Suppliers not null;
  grade                : Association to RawMaterialGrades not null;
  ruleTemplate         : Association to PriceRuleTemplates;
  purchasingOrg        : String(8);
  plant                : String(4);
  oldPrice             : Decimal(23,6) not null;
  proposedPrice        : Decimal(23,6) not null;
  priceUoM             : String(3) not null;
  priceUnit            : Integer not null default 1;
  currency             : String(3) not null;
  validFrom             : Date not null;
  validTo               : Date;
  observationFrom      : Date;
  observationTo        : Date;
  sourceReference      : String(200);
  reason               : String(500) not null;
  status               : RequestStatus default #DRAFT;
  submittedAt          : Timestamp;
  submittedBy          : String(100);
  decidedAt            : Timestamp;
  decidedBy            : String(100);
  decisionComment      : String(500);
}

entity ApprovalRecords : cuid, managed {
  objectType           : String(30) not null;
  objectID             : UUID not null;
  objectVersion        : Integer not null;
  step                 : Integer not null default 1;
  decision             : String(20) not null;
  actor                : String(100) not null;
  actorRole            : String(50);
  comment              : String(500);
  decidedAt            : Timestamp not null;
}

entity GoodsReceipts : cuid, managed, Versioned {
  materialDocument     : String(20) not null;
  fiscalYear           : String(4) not null;
  documentItem         : String(4) not null;
  purchaseOrder        : String(20) not null;
  purchaseOrderItem    : String(5) not null;
  contractItem         : Association to ContractItems;
  supplier             : Association to Suppliers not null;
  material             : Association to Materials not null;
  plant                : String(4) not null;
  postingDate          : Date not null;
  documentDate         : Date not null;
  movementType         : String(3) not null;
  quantity             : Decimal(23,9) not null;
  uoM                  : String(3) not null;
  amount               : Decimal(23,6);
  currency             : String(3);
  reversalOf           : UUID;
  sourceSystem         : String(20) default 'S4_DEMO';
}

entity CalculationRuns : cuid, managed, Versioned {
  runNumber            : String(30) not null;
  priceChange          : Association to PriceChangeRequests not null;
  periodFrom           : Date not null;
  periodTo             : Date not null;
  cutoffAt             : Timestamp not null;
  status               : RunStatus default #QUEUED;
  priority             : Integer default 100;
  eligibleGrCount      : Integer default 0;
  processedGrCount     : Integer default 0;
  exceptionCount       : Integer default 0;
  totalEligibleQty     : Decimal(23,9) default 0;
  totalAmount          : Decimal(23,6) default 0;
  currency             : String(3);
  requestedBy          : String(100);
  claimedBy            : String(100);
  claimedAt            : Timestamp;
  heartbeatAt          : Timestamp;
  completedAt          : Timestamp;
  errorMessage         : String(1000);
  configSnapshot       : LargeString;
}

entity CalculationLines : cuid, managed {
  run                  : Association to CalculationRuns not null;
  goodsReceipt         : Association to GoodsReceipts not null;
  profile              : Association to PartProfiles;
  constituent          : Association to PartConstituents;
  eligibleQuantity     : Decimal(23,9) not null;
  normalizedRmContent  : Decimal(23,9) not null;
  oldPrice             : Decimal(23,6) not null;
  newPrice             : Decimal(23,6) not null;
  priceDelta           : Decimal(23,6) not null;
  amount               : Decimal(23,6) not null;
  currency             : String(3) not null;
  included             : Boolean default true;
  exceptionCode        : String(30);
  explanation          : String(1000);
}

entity ContractPriceProposals : cuid, managed, Versioned {
  proposalNumber       : String(30) not null;
  run                  : Association to CalculationRuns not null;
  contractItem         : Association to ContractItems not null;
  oldPrice             : Decimal(23,6) not null;
  proposedPrice        : Decimal(23,6) not null;
  currency             : String(3) not null;
  priceUnit            : Integer not null default 1;
  validFrom             : Date not null;
  validTo               : Date;
  status               : RequestStatus default #DRAFT;
  s4WorkflowStatus     : String(30);
  s4ChangeReference    : String(60);
}

@assert.unique.idempotencyKey: [idempotencyKey]
entity PostingRecords : cuid, managed {
  objectType           : String(30) not null;
  objectID             : UUID not null;
  idempotencyKey       : String(64) not null;
  requestHash          : String(64) not null;
  postingType          : String(30) not null;
  status               : PostingStatus default #PENDING;
  simulated            : Boolean default true;
  sapDocument          : String(30);
  sapFiscalYear        : String(4);
  postedAt             : Timestamp;
  message              : String(1000);
  reversalOf           : UUID;
}

entity AppSettings : managed {
  key settingKey       : String(80);
  category             : String(40) not null;
  value                : String(500) not null;
  dataType             : String(20) not null default 'STRING';
  description          : String(500);
  adminEditable        : Boolean default true;
  restartRequired      : Boolean default false;
}

entity MovementTypeRules : managed {
  key movementType     : String(3);
  description          : String(100);
  eligible             : Boolean default true;
  quantitySign         : Integer not null default 1;
  requiresReference    : Boolean default false;
}

entity ApprovalPolicies : cuid, managed, Versioned {
  code                 : String(30) not null;
  objectType           : String(30) not null;
  companyCode          : String(4);
  purchasingOrg        : String(8);
  minimumAmount        : Decimal(23,6) default 0;
  maximumAmount        : Decimal(23,6);
  currency             : String(3);
  requiredRole         : String(50) not null;
  sequence             : Integer not null default 1;
  active               : Boolean default true;
}

entity SystemEvents : cuid {
  occurredAt           : Timestamp not null;
  severity             : String(10) not null;
  category             : String(30) not null;
  correlationId        : String(80);
  objectType           : String(30);
  objectID             : UUID;
  message              : String(1000) not null;
}
