# Raw Material Content Management Application

## Binding Project Guidelines and Solution Baseline

| Attribute | Value |
|---|---|
| Document ID | RMC-PG-001 |
| Version | 0.2.0 |
| Status | Binding baseline; open decisions are explicitly marked |
| Effective date | 2026-10-19 |
| Target landscape | Phase 1: SAP BTP trial account; target: SAP S/4HANA RISE 2023 and productive SAP BTP Cloud Foundry |
| Application style | SAP CAP Node.js service with SAPUI5/Fiori user experience |
| Primary priorities | 1. S/4HANA clean core; 2. minimum recurring BTP cost; 3. correctness and auditability |
| Persistent system of record | Trial: resettable synthetic demo store; target: S/4HANA through approved extensibility and released services |

## 1. Purpose and authority

This document is the binding architecture, functional-control, delivery, and governance framework for the Raw Material Content Management (RMC) application. It establishes the boundaries within which requirements, designs, code, integrations, and deployments must be created.

The application will reproduce only the business capabilities relevant to raw-material content, retrospective raw-material price changes, provision/revaluation calculation, and purchasing-contract price updates. It is not a general replacement for Vistex.

The words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative:

- **MUST/MUST NOT**: mandatory unless an exception is approved under section 4.
- **SHOULD/SHOULD NOT**: expected; deviation requires an Architecture Decision Record (ADR).
- **MAY**: optional.

When documents conflict, the following order applies:

1. Legal, regulatory, security, and statutory-accounting obligations
2. This guideline and its approved amendments
3. Approved ADRs and signed functional specifications
4. Sprint stories, UI designs, and implementation notes

## 2. Business outcomes

The application MUST provide:

1. Linkage of S/4HANA purchasing contracts, vendors, and parts.
2. Effective-dated BOM explosion and constituent management.
3. Raw-material type, grade, and related master data.
4. A complete, explainable raw-material view for each applicable part.
5. Controlled vendor-level raw-material type/grade price changes.
6. Retrospective impact and provision/revaluation calculation using eligible GR quantities, followed by approval and controlled posting to S/4HANA.
7. Approved purchasing-contract price changes in S/4HANA.

The application SHOULD improve on the current process through traceability, simulation, mass processing, explainable calculations, exception handling, reconciliation, and a purpose-built user experience.

## 3. Non-negotiable principles

### 3.1 Clean core

1. CAP MUST NOT connect to the S/4HANA database or read/write S/4 tables directly.
2. No code may update SAP standard tables, use native SQL against S/4HANA, or depend on database-table layouts.
3. Integration MUST use released SAP APIs, released CDS views, events, or clean-core ABAP Cloud services.
4. New S/4 persistence MUST be isolated in customer-owned entities and exposed by an approved service contract.
5. New ABAP development MUST use ABAP Cloud language restrictions and released objects where the installed S/4 edition and extensibility model support them.
6. Classic BAPIs, function modules, reports, implicit enhancements, modifications, unreleased CDS views, and unreleased tables are prohibited by default.
7. SAP GUI automation, batch-input recording, and robotic execution of transaction codes are prohibited.
8. Standard S/4 behavior MUST not be reimplemented when a suitable released API or standard workflow exists.
9. Every SAP interface MUST be checked in the actual S/4HANA 2023 system and the SAP Business Accelerator Hub. An API name in a design document is not proof of availability or release status.
10. Custom objects MUST reside in a dedicated package and namespace, with an explicit software component, transport path, owner, and lifecycle.

### 3.2 Minimum BTP cost

1. SAP HANA Cloud is prohibited for the baseline solution.
2. CAP MUST operate without a production database binding. Its data model may describe remote projections but MUST NOT silently create application persistence in production.
3. The initial BTP service allow-list is:
   - Cloud Foundry runtime
   - Authorization and Trust Management service (XSUAA), or the approved equivalent already covered by the enterprise landscape
   - Destination service
   - Connectivity service only when the RISE network route technically requires it
4. SAP Build Process Automation, Integration Suite, Event Mesh, HANA Cloud, Document Management Service, Alert Notification, and third-party paid services MUST NOT be introduced without a costed ADR.
5. The UI SHOULD be packaged with the application router when doing so avoids an additional paid service and satisfies operations requirements.
6. Approval workflows SHOULD initially use a lightweight domain state machine, persisting status and audit records in the S/4 extension. SAP standard Flexible Workflow SHOULD be used where the final approval must occur in S/4.
7. Polling, delta extraction, and synchronous API integration MAY be used before adding event infrastructure, provided volume and latency tests pass.
8. Each proposed BTP service MUST include forecast monthly consumption, commercial entitlement, support ownership, and an exit/removal plan.

For the trial/demo phase:

1. The application MUST remain within services and quotas available to the selected BTP trial account; no paid subscription may be assumed.
2. Trial entitlements and regional availability MUST be verified immediately before deployment because SAP may change them.
3. The demo SHOULD use only Cloud Foundry runtime and the minimum identity/routing services required by that trial landscape.
4. No service may be adopted merely because it is free in the trial if it would create a paid or mandatory dependency in the target landscape.
5. If Cloud Foundry or a required service is unavailable in the chosen trial region, the fallback is a local CAP demo or an explicitly approved BTP free-tier/commercial subaccount—not an unplanned architecture change.

Minimum BTP cost does not mean minimum total cost. Moving persistence and processing into S/4 can increase ABAP delivery, S/4 storage, operations, and upgrade-testing costs. Total cost MUST be considered, although the no-HANA-Cloud constraint remains binding until amended.

### 3.3 Financial correctness and auditability

1. Every monetary result MUST be reproducible from immutable input snapshots.
2. Every calculated amount MUST expose a human-readable calculation trace.
3. Approved records MUST NOT be edited in place. Corrections require reversal, supersession, or a new version.
4. No posting may occur without an approved business document, an idempotency key, a pre-posting validation, and a retained SAP response.
5. Calculation, approval, posting, reversal, and reconciliation duties MUST support segregation of duties.
6. Financial rules MUST never rely on binary floating-point arithmetic. Currency and quantity precision must use deterministic decimal handling.

## 4. Exceptions and change governance

Any exception to a MUST/MUST NOT rule requires an ADR containing:

- Requirement and business reason
- Options considered
- Clean-core classification and evidence
- Security, upgrade, audit, support, and cost impacts
- Named business, Finance, Security, S/4 Architecture, and Product approvals
- Expiry or review date
- Remediation/exit plan

An exception MUST NOT be hidden inside a story or code review. Emergency exceptions expire within 90 days unless formally renewed.

Changes to scope are accepted only when they include process ownership, acceptance criteria, data impact, authorization impact, integration impact, recurring cost, reconciliation impact, and migration approach.

## 5. Target architecture

```text
Users
  |
SAPUI5/Fiori UI + application router (Cloud Foundry)
  |
CAP Node.js application service (stateless)
  |
Destination/OAuth and, only if required, Connectivity
  |
+------------------------ S/4HANA service boundary -------------------------+
| Released standard APIs/CDS        Clean-core custom ABAP service          |
| - contract and item               - RM type and grade                    |
| - supplier/business partner       - vendor RM price/version              |
| - material/part                   - composition and BOM snapshots         |
| - BOM source                      - price-change requests                |
| - material documents/GR           - calculation and approval records     |
| - currencies/UoM                  - posting/reconciliation references     |
+---------------------------------------------------------------------------+
```

### 5.1 Responsibilities

**CAP MUST own:**

- Purpose-built APIs for the UI
- Orchestration and validations spanning remote S/4 services
- Calculation execution when the volume test supports it
- User-facing workflow actions
- Authorization checks in addition to S/4 authorization
- Idempotent calls and error translation
- UI-oriented search, filtering, and value-help composition

**S/4HANA MUST own:**

- Authoritative supplier, material, purchasing, BOM, goods-receipt, currency, and accounting data
- Custom RMC persisted data
- Final standard business documents
- Standard change documents and workflow where applicable
- Accounting period and posting validations

CAP MUST NOT become a shadow ERP. Duplication is allowed only for immutable calculation snapshots, posting evidence, or explicitly approved performance projections.

### 5.2 Production statelessness

- CAP instances MUST tolerate restart and horizontal scaling without loss of business state.
- Temporary processing data MUST have a bounded lifetime and contain no unrecoverable state.
- Long-running jobs MUST checkpoint durable state in the approved S/4 extension or use an already-entitled platform job mechanism.
- Local or ephemeral SQLite MAY be used for automated tests, developer fixtures, and the resettable trial demo; it MUST NOT be promoted to production.

### 5.3 Trial-first demo architecture

The first deployed application will run in an SAP BTP trial account for demonstrations, process discovery, and design decisions. It will not connect to the productive S/4HANA system and will not perform legally or financially effective postings.

```text
Trial users
   |
SAPUI5/Fiori UI + application router (BTP trial)
   |
CAP services and production-intent domain logic
   |
+---------------------- replaceable adapters ----------------------+
| Mock S/4 reference API | Demo repository | Posting simulator     |
+-------------------------------------------------------------------+
   |
Synthetic contracts, suppliers, parts, BOMs, GRs, prices and results
```

The demo MUST follow these rules:

1. Only synthetic or irreversibly anonymized data may be loaded. Real supplier prices, contracts, GRs, personal data, credentials, or confidential BOMs are prohibited.
2. The UI MUST display a persistent **DEMO — NOT CONNECTED TO S/4HANA** indicator.
3. All posting actions MUST invoke a posting simulator and return clearly synthetic document numbers.
4. Demo emails, approvals, and identities MUST NOT be interpreted as production controls.
5. Demo persistence is disposable. The application MUST provide a documented reset/reseed operation and must tolerate trial-account suspension, restart, or data loss.
6. Seed datasets MUST cover happy paths and representative exceptions, reversals, approval rejections, and reconciliation differences.
7. Demo shortcuts MUST be tagged in the backlog and MUST NOT leak into productive profiles.
8. The production build MUST fail if a mock adapter or demo seed endpoint is enabled in a productive deployment profile.

### 5.4 Port-and-adapter boundary

To avoid rewriting the application after the demo, domain logic and UI-facing services MUST depend on stable application interfaces, not directly on mock files or SAP-specific payloads. At minimum, these ports SHOULD be defined:

- `S4ReferenceDataPort`: contracts, suppliers, materials, BOMs, material documents, currencies, and UoMs
- `RmcRepositoryPort`: RMC-owned master, version, workflow, calculation, and posting records
- `PostingPort`: provision/revaluation simulation, post, status inquiry, and reversal
- `ContractUpdatePort`: contract-price simulation, update, workflow status, and reread
- `IdentityAuthorizationPort`: user, role, delegation, and organizational scope

Trial adapters will use seeded demo data. Productive adapters will call verified released S/4 services and clean-core custom APIs. Business formulas, workflow invariants, validation, UI contracts, and automated tests SHOULD remain unchanged across adapters.

SAP payload structures MUST be mapped at the adapter boundary into a canonical application model. SAP technical names MUST NOT be scattered through UI code or domain formulas.

### 5.5 Meaning of “90% finalized”

The move from the trial account to the actual BTP/S/4HANA landscape is controlled by a transition gate, not an informal percentage estimate. “90% finalized” means at least 90% of the weighted, agreed product-definition scope is accepted by the Product Owner, Purchasing, and Finance.

The weighting and scope baseline MUST be agreed before demo iteration begins. Acceptance requires:

- Approved process flows and user journeys
- Approved logical data model and field catalog
- Approved formulas, validity, precedence, conversion, sign, and rounding policies
- Approved workflow states, roles, thresholds, and segregation of duties
- Approved BOM and GR eligibility rules
- Approved provision/revaluation and contract-update outcomes
- Approved reports, exception handling, reconciliation, and audit evidence
- A prioritized list of the remaining 10%, with no unresolved item that can materially change architecture, accounting, security, or integration

The 90% threshold is a product-definition milestone, not evidence that the demo code is production-ready. Productive integration, security hardening, performance testing, migration, operations, and financial controls remain mandatory after transition.

## 6. Functional domain model

The following is a logical model. Physical S/4 entities and released service contracts are decided during detailed design.

### 6.1 S/4 reference objects

| Object | Minimum identifying/context fields |
|---|---|
| Supplier | Supplier ID, business-partner ID, company code/purchasing-org applicability, status |
| Part/material | Material ID, description, base UoM, material type, plant, status |
| Purchase contract | Contract and item, supplier, company code, purchasing organization/group, plant, material, target quantity/value, validity, currency, order price unit, conditions, release status |
| BOM | Material, plant, usage, alternative, base quantity, validity, change number/status, item/component, component quantity/UoM, item category |
| Material document/GR | Material document/year/item, purchase order/item, posting/document date, movement type, quantity/UoM, amount/currency, supplier, plant, reversal/reference document |

Only stable keys and necessary snapshots SHOULD be retained. Current descriptive attributes SHOULD be read from S/4 rather than duplicated.

### 6.2 RMC-owned objects

| Entity | Required content |
|---|---|
| Raw Material Type | Code, name, commodity/category, active status, default price UoM/currency, owner |
| Raw Material Grade | Type, grade code/name, specification, purity/quality attributes, default conversion/yield, active status |
| Part RM Profile | Part, plant, optional supplier/contract context, BOM reference, status, valid-from/to, version |
| RM Constituent | Profile, BOM lineage/component, RM type/grade, quantity or percentage, UoM, weight/conversion/yield/scrap factors, source, override reason |
| Vendor RM Price | Supplier, purchasing organization/plant applicability, RM type/grade, price, price UoM, currency, valid-from/to, source/index basis, version and approval status |
| Price Change Request | Previous/proposed values, requested effective date, evidence, impact summary, status, requester and approval history |
| Calculation Run | Run type, selection parameters, rule-set version, cutoff timestamp, input snapshots, totals, status |
| Calculation Line | GR reference, contract/PO reference, profile/version, constituent, old/new price, conversions, eligible quantity, calculated delta, exclusions, rounding |
| Provision/Revaluation Request | Calculation run, posting purpose, company code, supplier, currency, amount, proposed posting date, accounting/posting parameters, approval status |
| Contract Price Proposal | Contract/item, old/proposed price or condition, validity, calculation reference, approval status, S/4 response |
| Approval Record | Object/type, step, decision, actor, role, timestamp, comment, delegated actor and evidence |
| Posting Record | Business object, immutable idempotency key, request hash, SAP document/reference, status, messages, retry/reversal relationship |

Every business entity MUST include a technical UUID, business key where required, created/changed metadata, optimistic concurrency token, lifecycle status, version, and retention classification.

## 7. Detailed functional requirements

### 7.1 Contract, vendor, and part linkage

1. Users MUST select only valid combinations allowed by S/4 purchasing data.
2. Contract header and item validity, deletion/block status, release status, plant, purchasing organization, supplier, material, currency, price unit, and conditions MUST be validated.
3. Linkage MUST be effective-dated and versioned.
4. The system MUST detect duplicate and overlapping active linkages.
5. Vendor/material aliases MAY be displayed but S/4 keys remain authoritative.
6. Mass selection and mass validation SHOULD be supported.
7. A broken/deleted S/4 reference MUST be flagged; historical approved snapshots MUST remain readable.

### 7.2 BOM explosion and constituent management

The explosion contract MUST specify:

- Plant, BOM usage, alternative BOM, key date, change number, lot size, and required quantity
- Single-level versus multi-level explosion
- Maximum depth and recursion/cycle handling
- Phantom assemblies
- Alternative/probability items
- Co-products/by-products where relevant
- Fixed quantities, component and assembly scrap, operation scrap, and net indicators
- Discontinuation/follow-up materials
- Rounding and UoM conversion
- Configurable materials, classes, and variant selection when applicable
- Excluded/non-RM components and unmapped constituents

Each accepted explosion MUST create an immutable snapshot containing source identifiers, timestamp, parameters, component lineage/path, source quantities, conversion factors, and resulting normalized content.

Manual composition overrides MUST require a reason and, after activation, approval. The UI MUST distinguish S/4-derived values, rule-derived values, and manual overrides.

The application MUST prevent activation when mandatory components are unmapped, composition exceeds configured tolerances, UoM conversion is missing, or the BOM is invalid for the profile date.

### 7.3 Raw-material type and grade master data

At minimum, the model SHOULD support:

- Type/category and grade hierarchy
- Description and controlled synonyms
- Commodity/index association
- Technical specification, purity, density, yield, or recovery factor when relevant
- Standard price UoM and allowed alternate UoMs
- Default currency and permitted currencies
- Region, market, source, incoterm, freight or basis adjustment when price formation requires them
- Validity, lifecycle status, ownership, evidence, and approval

Codes MUST NOT be physically deleted after use. They may be blocked or expired. Type/grade changes affecting calculations MUST be versioned.

### 7.4 Part raw-material content

The part profile MUST present, as applicable:

- S/4 part and plant information
- Supplier and contract context
- BOM source, alternative, key date, and snapshot version
- RM type/grade per constituent
- Gross quantity, net quantity, percentage/weight, scrap, recovery/yield, and normalized quantity per part
- Base, current, proposed, and effective RM prices
- Currency/UoM conversion and source
- Contribution per RM line and total RM contribution to part price
- Non-RM component, conversion, value-add, freight, overhead, or other agreed price buckets when needed to reconcile the complete contract price
- Baseline date/price and current/proposed validity
- Approval, completeness, exception, and synchronization status
- Full calculation trace and change history

The system MUST validate percentage/quantity totals using configurable tolerance. It MUST not assume every BOM component is itself a raw material.

### 7.5 Vendor-level RM type/grade price changes

Price formation MUST support the agreed subset of these patterns without hard-coding them into UI logic:

- Direct entered price
- Absolute or percentage adjustment
- Published index with lag
- Average over a defined observation window
- Currency conversion on a defined date/rate type
- Premium/discount, freight, treatment, conversion, or regional differential
- Floor, ceiling, collar, threshold, or no-change band
- Rounding and minimum-change rules

A request MUST capture supplier, organizational applicability, type/grade, old/proposed price, currency, price UoM, source, observation period, requested effective period, formula parameters, evidence, requester, and reason.

Validation MUST reject gaps or overlaps contrary to the configured policy, zero/negative values when disallowed, missing conversions, duplicate requests, retroactivity beyond the open-policy window, and unauthorized supplier scope.

Recommended states:

```text
Draft -> Submitted -> Under Review -> Approved -> Scheduled/Effective -> Superseded
                    \-> Rejected
Draft/Submitted -> Cancelled
Approved/Effective -> Reversal or corrective version (never destructive edit)
```

Maker and approver MUST be different for financially relevant changes. Threshold and exceptional-change approvals SHOULD be configurable by company code, purchasing organization, amount, percentage, and retroactive age.

### 7.6 Retrospective provision/revaluation calculation

The business must first classify each run as one of the following; they MUST NOT be conflated:

- **Provision/accrual:** an accounting estimate posted before final settlement.
- **Purchase-price revaluation/subsequent debit or credit:** a vendor-facing logistics-invoice adjustment such as the business outcome associated with MRNB.
- **Contract price update:** a future or effective-dated change to the purchasing contract.

#### 7.6.1 Selection

Each run MUST freeze:

- Company code, purchasing organization, plant, supplier, contract/PO/part scope
- Retrospective validity interval
- GR selection date basis: posting date, document date, or another approved basis
- Cutoff timestamp and open/closed posting period
- Movement-type policy
- Currency/rate-date/rate-type policy
- RM price versions and part-profile versions
- Previous run, settlement, reversal, and exclusion references

GR eligibility MUST explicitly handle at least goods receipts, GR reversals, returns to vendor, subsequent adjustments, blocked stock, delivery costs, subcontracting, consignment, unit conversion, partial receipts, cancelled documents, and duplicate/reprocessed documents. Applicable movement types MUST be configuration, not source code.

#### 7.6.2 Calculation

A baseline line formula is:

```text
normalized RM content per part
  = constituent quantity
    x UoM conversion
    x approved yield/recovery/scrap treatment

RM delta per part
  = sum(normalized RM content per part x (new RM price - old RM price))

gross retrospective impact
  = net eligible GR quantity x RM delta per part

amount proposed now
  = gross retrospective impact
    - previously posted/settled amount
    - approved exclusions/offsets
```

This is a framework, not a final accounting policy. Treatment of scrap, yield, taxes, freight, exchange rates, price units, debit/credit signs, and rounding MUST be signed off by Finance and Purchasing.

Rounding level—constituent, GR line, contract item, supplier/currency total, or posting document—MUST be explicit and consistent between simulation and posting.

#### 7.6.3 Explainability and review

Users MUST be able to drill from a total to supplier, contract/PO item, part, GR, constituent, price version, formula, conversion, and rounding entry. Each excluded item MUST carry a reason. Manual amount override is prohibited by default; if enabled by exception, original amount, revised amount, reason, and additional approval are mandatory.

Runs MUST support simulation, exception resolution, recalculation as a new version, comparison between versions, approval, posting, partial failure handling, reversal, and reconciliation.

### 7.7 S/4 posting and MRNB boundary

MRNB is an SAP GUI transaction/business process, not an integration API. The application MUST NOT automate its screen or call its underlying program merely because the transaction exists.

Before build, a technical spike MUST determine:

1. The exact document and accounting outcome currently produced by MRNB in this landscape.
2. Whether the requirement is a provision journal, a supplier subsequent debit/credit, a revaluation document, or a combination.
3. The released API, standard application job, or supported extension point that produces the required outcome.
4. Tax, invoice verification, payment, blocking, reversal, and reference behavior.
5. Whether posting is legally and operationally permissible from a custom application.

Candidate interfaces may include released supplier-invoice/subsequent-debit-credit or journal-entry APIs, but no interface is approved until verified in the actual system.

Posting controls MUST include:

- Simulation/precheck
- Open-period and authorization validation
- Immutable request hash and idempotency key
- External reference understandable to Finance
- No blind retry after an ambiguous timeout
- Persisted SAP messages and document identifiers
- Controlled retry of rejected items
- Reversal/correction relationship
- Reconciliation of calculated, approved, sent, posted, reversed, and outstanding totals

### 7.8 Purchasing-contract price changes

1. The proposal MUST reference an approved calculation and show old/new contract conditions, price unit, currency, scale, and validity.
2. Existing and future condition intervals MUST be checked for gaps and overlaps.
3. The application MUST preserve non-RM price buckets unless the approved rule explicitly changes them.
4. Updates MUST use a released Purchase Contract API or another verified clean-core interface.
5. If S/4 Flexible Workflow governs contract release, S/4 approval remains authoritative; the custom application MUST not falsely display a contract as finally approved before S/4 approval completes.
6. A changed contract MUST be re-read and reconciled after posting.
7. Concurrent S/4 changes MUST be detected and must stop or rebase the proposal rather than overwrite them.

## 8. Vistex-informed parity checklist

Public Vistex information describes broad price, agreement, incentive, calculation, accrual, settlement, workflow, and analytics capabilities. Detailed Vistex data models and customer configurations are licensed/proprietary and were not available in this workspace. Consequently, this checklist captures the relevant business-control patterns without copying Vistex internals or claiming one-to-one technical equivalence.

The solution MUST assess the following before declaring functional parity for the scoped process:

| Capability pattern | RMC interpretation |
|---|---|
| Agreement context | Purchasing contract/vendor/part linkage and validity |
| Flexible eligibility | Organizational, supplier, contract, material, plant, RM type/grade applicability |
| Effective-dated conditions | Versioned RM prices, formulas, contract prices, and content profiles |
| Calculation sheets | RM constituent and non-RM price-component breakdown with formulas |
| Business-volume selection | Eligible GR/material-document selection with reversals and exclusions |
| Accrual/provision | Versioned estimate with approval, posting, and true-up |
| Settlement/revaluation | Subsequent debit/credit or other approved S/4 outcome |
| Mass processing | Upload, validate, simulate, approve, post, retry, and reconcile in controlled batches |
| Workflow/status | Maker-checker, thresholds, rejection/rework, delegation, comments, evidence |
| Claims/exceptions | Disputed/excluded calculation lines, reason codes, owner, resolution history |
| Auditability | Immutable versions, change log, calculation trace, approval and posting evidence |
| Reporting | Exposure, effective price, outstanding provision, posted/reversed amounts, exceptions |
| Integration | S/4 master/transaction references and clean-core posting interfaces |

Useful scoped details that are often missed and MUST be decided are:

- Validity overlap/gap policy
- Hierarchy and precedence when multiple prices/formulas qualify
- Baseline and reset behavior
- Index observation window, lag, averaging, and publication corrections
- Price units such as price per 1, 100, or 1,000 units
- Currency and UoM conversion dates
- Thresholds, caps/floors, tolerances, and rounding sequence
- Negative adjustments and credit handling
- Retroactive corrections after prior posting
- Partial settlement, dispute, reversal, and rerun rules
- Attachments/evidence and retention
- Mass-change templates with row-level validation
- Simulation versus active calculation versions
- Period close, cut-off, reconciliation, and sign-off

## 9. Workflow and authorization

### 9.1 Workflow design

Workflow definitions MUST be configuration-driven for role, threshold, and organizational scope, but executable business rules MUST remain testable and versioned.

Every decision MUST record actual user, acting/delegated user, role, timestamp, decision, comment, object version, and before/after hash. Delegation MUST be time-bounded and auditable.

Approving a stale version MUST be impossible. Material changes after submission MUST invalidate previous approvals.

### 9.2 Baseline roles

- RMC Master Data Steward
- Buyer/Commercial Analyst
- Price Requester
- Purchasing Approver
- Finance Reviewer
- Finance Poster or posting service identity
- Auditor/Read-only
- Support Operator
- Security Administrator

No production support role may silently edit approved financial data. Emergency access must follow enterprise firefighter controls.

Authorization MUST enforce both business role and organizational scope such as company code, purchasing organization, plant, and supplier group. CAP and S/4 MUST each enforce the access appropriate to their boundary.

## 10. Integration standards

1. OAuth-based technical communication and principal propagation SHOULD be used according to the enterprise identity model. Shared personal accounts are prohibited.
2. API contracts MUST be versioned and documented using CDS/OpenAPI metadata as appropriate.
3. Remote calls MUST use bounded timeouts, correlation IDs, structured errors, and controlled retries.
4. GET operations may be retried safely. Mutating operations require idempotency and must not be blindly retried.
5. `$select`, server-side filtering, pagination, and batching MUST be used to minimize load and data transfer.
6. Bulk calculations MUST not issue one remote call per row when a set-based API is available.
7. No interface may depend on translated descriptions as keys.
8. Time values MUST be stored unambiguously in UTC with business date and S/4 time-zone semantics preserved separately.
9. S/4 API throttling, payload limits, and batch behavior MUST be tested rather than assumed.

Candidate standard API areas to verify include Business Partner/Supplier, Product/Material, Bill of Material, Purchase Contract, Material Document, Supplier Invoice, Journal Entry, Currency, and Unit of Measure. Technical names and operations MUST be confirmed in the target system.

## 11. Security, privacy, and records

- Apply least privilege, deny by default, and segregate display, maintain, approve, and post permissions.
- Secrets and certificates MUST reside in approved bindings or credential stores, never source control or application configuration files.
- Application logs MUST not contain access tokens, credentials, full financial payloads, or unnecessary personal data.
- All external inputs, spreadsheet uploads, comments, and filenames MUST be validated and safely rendered.
- Export authorization and data-volume limits MUST be explicit.
- Retention periods for calculation evidence, approvals, attachments, and posting records MUST be signed off by Finance, Legal, and Records Management.
- Attachments MUST not be stored as database blobs in custom S/4 entities without an approved storage and retention design. Prefer an already-approved enterprise content repository and retain only governed references.
- Security and audit events MUST be distinguishable from diagnostic logs.

## 12. Non-functional requirements

Numeric service levels remain open until volumes are supplied. The final NFR baseline MUST include:

- Interactive response targets by operation
- Maximum synchronous calculation size
- Batch throughput for GR lines and BOM components
- Concurrent users and peak periods
- S/4 call-rate budget
- Availability and support hours
- Recovery time and recovery point objectives
- Retention and archive volumes
- Accessibility target, recommended WCAG 2.1 AA
- Supported browsers and devices

The UI MUST remain responsive for long-running work. Calculations exceeding the synchronous threshold MUST run as resumable jobs with visible progress and safe restart.

## 13. User-experience standards

The UI SHOULD follow Fiori interaction and accessibility conventions without being limited to generated floorplans where a freestyle experience materially improves the task.

Users MUST have:

- Worklists by status and responsibility
- Search/value help using authoritative S/4 keys and descriptions
- Draft validation before submission
- Side-by-side old/new comparison
- BOM tree and flattened RM content views
- Calculation drill-down and formula explanation
- Exception workbench
- Mass upload with preview and row-level errors
- Approval inbox/history
- Posting and reconciliation status
- Export controlled by authorization

The UI MUST not contain authoritative calculation logic. Client calculations may display previews only; server results are controlling.

## 14. Engineering and delivery controls

### 14.1 Repository and quality

- One documented build and deployment path per environment
- No production credentials or generated secrets in Git
- Dependency lock files committed and reviewed
- Automated linting, unit tests, service-contract tests, security scanning, and build verification
- Peer review required for all production changes
- Financial formula changes require named business/Finance review and golden-result tests
- Database or service-schema changes require backward-compatibility and migration analysis

### 14.2 Required test layers

1. Domain unit tests for formulas, precedence, validity, signs, UoM/currency, and rounding.
2. Property/boundary tests for date overlaps, zero/negative values, large values, and precision.
3. Contract tests against mocked and real non-production S/4 services.
4. BOM scenario tests including alternatives, phantom levels, scrap, recursion, and missing mappings.
5. GR eligibility tests including reversals, returns, duplicates, and cutoff behavior.
6. Workflow/authorization and segregation-of-duty tests.
7. Idempotency, timeout, retry, partial failure, and reversal tests.
8. Reconciliation tests against independently calculated reference results.
9. Performance and volume tests with production-like distributions.
10. Upgrade regression tests for each S/4 release/FPS and relevant BTP runtime update.

### 14.3 Golden datasets

A controlled golden dataset MUST cover at least:

- Single and multi-level BOMs
- Multiple grades and currencies
- Price-unit and UoM conversions
- Mid-period price change
- GR and full/partial reversal
- Return to vendor
- Previously provisioned and partially settled amounts
- Negative price delta
- Rounding edge cases
- Overlapping validity rejection
- Contract changed concurrently in S/4
- Posting timeout followed by status inquiry
- Reversal and corrected rerun

## 15. Operations, reconciliation, and support

Each request MUST carry a correlation ID from UI through CAP to S/4 and back. Operational dashboards MUST show failed remote calls, stuck workflows, calculation failures, posting ambiguity, and reconciliation differences.

A daily or period-close reconciliation MUST prove:

```text
calculated = excluded + pending approval + approved not posted
             + posted + failed/rejected + reversed/adjusted
```

Financial totals MUST also reconcile by company code, supplier, currency, posting period, and SAP document.

Support corrections MUST use governed business actions, not table editing. Runbooks are required for remote-system outage, expired credentials, ambiguous posting, duplicate prevention, partial batch failure, S/4 period closure, and reconciliation breaks.

## 16. Delivery gates

### Trial Gate T0 — Demo foundation

- Confirm the BTP trial region, Cloud Foundry entitlement, quota, identity approach, and expiry/retention constraints
- Establish repository, CI checks, deployment descriptor, application router, CAP service, and UI shell
- Define canonical ports, mock adapters, demo profile, and productive-profile safety checks
- Define the weighted product scope used to measure the 90% transition threshold
- Approve a synthetic-data policy and initial seed-data catalog

### Trial Gate T1 — End-to-end demonstrator

- Demonstrate synthetic contract/vendor/part linkage
- Demonstrate BOM explosion, constituent mapping, RM type/grade, and part RM profile
- Demonstrate vendor RM price requests and maker-checker approval
- Demonstrate retrospective calculations against synthetic GRs with drill-down
- Simulate MRNB-equivalent and contract-update postings without contacting S/4
- Demonstrate exception handling, rejection, reversal, rerun, and reconciliation
- Record feedback and decisions against versioned requirements

### Trial Gate T2 — Scope convergence

- Complete agreed user journeys and field-level reviews
- Compare the demo with the scoped current Vistex process using approved, anonymized examples
- Approve formulas, rules, workflow, reports, controls, and unresolved gaps
- Confirm at least 90% of weighted product-definition scope is accepted
- Confirm the remaining backlog contains no unresolved architectural, accounting, security, or integration blocker

### Transition Gate T3 — Authorization to enter the real landscape

- Steering group formally approves the transition
- Create target BTP account/subaccount, transport, identity, security, and operations designs
- Remove or disable demo-only endpoints and seed controls from productive profiles
- Reconfirm total-cost estimate and allowed BTP services
- Authorize non-production S/4 connectivity and sanitized integration testing

No real S/4 connectivity or real business data may be introduced before Gate T3.

### Productive Gate P0 — Landscape and process confirmation

- Confirm S/4HANA Cloud Private Edition versus other RISE edition
- Confirm installed release/FPS and ABAP Cloud/developer-extensibility capability
- Inventory current Vistex screens, fields, rules, reports, workflows, volumes, and extracts for the scoped process
- Confirm current MRNB inputs, outputs, document types, and reversals
- Confirm licensing and API availability

### Productive Gate P1 — Feasibility spikes

- Read contract/vendor/part using released APIs
- Execute required BOM explosion semantics
- Retrieve eligible GRs at representative volume
- Persist and expose one custom S/4 RMC entity using the approved clean-core method
- Produce the required MRNB-equivalent outcome through a supported interface, or record a formal gap
- Update a test purchasing contract through a supported interface and complete S/4 approval

No productive integration build may proceed until Gate P1 proves the two posting paths or the steering group accepts documented scope changes.

### Productive Gate P2 — Foundation

- Identity, roles, destinations, service contracts, logging, CI/CD, test harness, and cost baseline

### Productive Gate P3 — Master and content management

- Linkage, BOM snapshot, RM type/grade, part profiles, validation, and approvals

### Productive Gate P4 — Price change and calculation

- Vendor RM prices, formula versioning, simulation, retrospective calculations, workflow, and golden-result reconciliation

### Productive Gate P5 — Posting and contract update

- Idempotent posting, S/4 workflow integration, reconciliation, reversals, performance, and operational readiness

## 17. Definition of done

### 17.1 Trial demo-ready

A trial capability is demo-ready only when:

- Acceptance criteria pass against version-controlled synthetic scenarios
- The complete user journey, validation, explanation, and exception path can be demonstrated
- Mock behavior is clearly labeled and matches the agreed canonical service contract
- Automated domain tests pass
- Feedback questions and known gaps are recorded rather than hidden in the demo
- The application can be reset and reseeded without manual data repair
- No real credentials, confidential data, or productive endpoints are present

Demo-ready does not mean production-ready.

### 17.2 Production done

A productive capability is not done until:

- Acceptance criteria and accounting examples pass
- Clean-core evidence is recorded
- Recurring BTP and S/4 cost impact is recorded
- Authorization and SoD tests pass
- Audit trail and calculation explanation are complete
- Failure, retry, reversal, and reconciliation paths pass
- Support runbook and monitoring exist
- Data retention and migration are addressed
- Product owner, Purchasing, Finance, Security, and S/4 Architecture sign off where applicable

## 18. Explicit non-goals for the initial release

- Productive S/4 connectivity, productive data, or financially effective posting during the trial/demo phase
- Production-grade availability, durability, performance, or operational support from the disposable trial deployment
- General-purpose Vistex replacement
- Sales rebates, customer chargebacks, royalties, commissions, or channel incentives
- Direct S/4 table integration
- Generic enterprise workflow platform
- Generic commodity-trading platform
- Predictive/AI pricing
- Supplier portal unless separately approved
- Replacement of S/4 purchasing, invoice verification, accounting, or standard contract release

## 19. Decisions and assumptions requiring confirmation

| ID | Question/decision | Why it matters |
|---|---|---|
| OQ-01 | Is the RISE 2023 system S/4HANA Cloud Private Edition, and what FPS is installed? | Determines extensibility and released interfaces |
| OQ-02 | What exact Vistex product/version and configured RMC objects are used? | Required for field/rule/report parity rather than generic parity |
| OQ-03 | Is “provision through MRNB” an accrual, a subsequent debit/credit, or both? | Determines posting object, approval, reversal, and reconciliation |
| OQ-04 | Which GR movement types and date basis are eligible? | Controls financial quantity and cutoff |
| OQ-05 | Are calculations contract-, PO-, scheduling-agreement-, info-record-, or invoice-based? | Determines keys and source APIs |
| OQ-06 | Which BOM semantics are used: alternatives, phantom, configurable, subcontracting, scrap? | Determines explosion method and snapshot content |
| OQ-07 | How are RM prices formed: direct, index, average, lag, FX, premium, floor/cap? | Determines rule model |
| OQ-08 | How is total part price reconstructed from RM and non-RM buckets? | Required for contract-price proposal and reconciliation |
| OQ-09 | What are peak contracts, parts, BOM depth/items, GR lines/month, vendors, and users? | Determines CAP versus ABAP processing and NFRs |
| OQ-10 | Where must final approvals occur: custom app, S/4 Flexible Workflow, or both? | Avoids duplicate or conflicting approval authority |
| OQ-11 | What evidence/attachments are required and which content repository is already licensed? | No HANA Cloud/blob-store baseline |
| OQ-12 | What retention, fiscal-close, tax, and audit requirements apply by company code/country? | Determines records and posting design |
| OQ-13 | Which BTP trial region/account is available, and what Cloud Foundry quotas/services are currently entitled? | Determines the deployable demo footprint |
| OQ-14 | Who will access the demo, and is authenticated role-based access required for the first review? | Determines trial identity and authorization setup |
| OQ-15 | Which representative contracts, BOM patterns, price rules, GR/reversal cases, and approval paths must be synthesized first? | Determines the seed dataset and initial demo backlog |

## 20. Recommended additions to scope

The following should be included because they materially reduce financial and operational risk:

1. **Simulation and impact analysis** before approval.
2. **Immutable calculation snapshots and explainability** down to GR and constituent.
3. **Idempotency and reconciliation workbench** for all S/4 postings.
4. **Dispute/exception handling** rather than spreadsheet side processes.
5. **Mass maintenance with preview** for type/grade mappings and vendor prices.
6. **Period-close dashboard** for pending, posted, reversed, and unmatched values.
7. **Rule and formula versioning** independent of UI releases.
8. **Automated parity harness** comparing selected results with the current Vistex process during migration.
9. **Data-quality scoring** for missing mappings, stale BOMs, invalid UoMs, and price gaps.
10. **Controlled migration and coexistence period** with clear ownership to prevent double posting.

Items 1–8 SHOULD be treated as baseline controls, not optional enhancements. Items 9–10 may be phased but must be designed before production cutover.

## 21. Research basis and limitations

This baseline uses:

- The requirements supplied for a trial-first demo followed by S/4HANA RISE 2023, Cloud Foundry, S/4 persistence, clean core, and minimal BTP cost
- Public Vistex descriptions of SAP-integrated pricing, agreement, calculation, accrual/settlement, workflow, and analytics capabilities
- SAP clean-core, ABAP Cloud, CAP remote-service, S/4 API, purchasing, BOM, material-document, invoice-verification, and journal-entry architectural patterns

Starting references:

- Vistex public site and SAP solution portfolio: <https://www.vistex.com/> and <https://www.vistex.com/solutions-sap>
- SAP Business Accelerator Hub for interface verification: <https://api.sap.com/>
- SAP Cloud Application Programming Model documentation: <https://cap.cloud.sap/docs/>
- ABAP Cloud documentation entry point: <https://help.sap.com/docs/abap-cloud>
- SAP Help Portal for the exact S/4HANA edition/release: <https://help.sap.com/>

Public information is not sufficient to reconstruct a customer's licensed Vistex configuration. A responsible parity study requires approved access to the current configuration, representative contracts and calculations, field catalogs, workflow/status definitions, extracts, posting examples, reports, and licensed product documentation. Such material must be handled according to license and confidentiality obligations; the project MUST NOT copy proprietary Vistex code, database structures, or copyrighted screens.

## 22. Amendment history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-10-19 | Added BTP trial-first demo architecture, synthetic-data controls, adapter boundaries, 90% transition definition, and trial/productive delivery gates |
| 0.1.0 | 2026-10-19 | Initial binding baseline |

