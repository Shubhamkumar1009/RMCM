# Legacy RMCM Parity and Issue-Prevention Audit

## Audit boundary and evidence

Audit date: **2026-11-01**.

The user explicitly brought `artefacts/Old RMCM Application/` into scope. The following six artifacts were reviewed completely and read-only:

| Artifact | Native coverage reviewed |
|---|---:|
| `RM Indexing Admin.docx` | 13 pages, 10 tables, 23 embedded screen images |
| `RM Indexing User Manual (Approval).docx` | 36 pages, 11 tables, 50 unique embedded screen images |
| `RM Indexing User Manual (Buyer).docx` | 83 pages, 46 tables, 117 unique embedded screen images |
| `RMCM Screen wise fields.xlsx` | `Field workflow`, 81 × 41 used range |
| `Raw Material Content Management Challenges.pptx` | 9 slides, including every challenge/impact/improvement table |
| `PVEV RMCM_PDCA.xlsx` | process map plus why-why, concern, required-modification and action sheets |

All 190 unique embedded manual images and all nine issue slides were visually inspected. This review does not authorize copying proprietary implementation code, insecure patterns, real data, direct S/4 access or legacy defects.

## Executive conclusion

The current application is already stronger than the legacy application in effective dating, recursive BOM lineage, immutable revisioning, deterministic decimal calculation, explainability, optimistic concurrency, idempotency, exception resolution, reversal/rerun evidence and reconciliation.

The legacy application was broader in several operational areas: bulk templates, explicit two-level approval, amendment attachments, role substitution, detailed VPL geometry/cost attributes, multiple amendment dates and a large report catalog. The present increment incorporates the safe canonical fields and controls, exposes audit evidence and records the remaining parity backlog. Financial formulas and productive integrations are not activated without the approvals required by `PROJECT_GUIDELINES.md`.

## Legacy capability inventory and disposition

| Legacy capability | Current disposition |
|---|---|
| Commodity, RM type, grade and subgrade maintenance | Covered with stronger RM Admin request/activation, validity, unique codes and deletion markers. |
| User creation, role assignment and role substitution | Productive IAS/XSUAA role collections and delegation remain gated; dummy authentication is trial-only. Do not rebuild SAP HR user administration in CAP. |
| RM price and scrap-price masters | RM price master/change is covered. Governed scrap-price master remains a signed-rule follow-on. |
| Vendor-part linkage with contract, MASOP/Bought Out and frequency | Contract workflow was already covered. `linkageType`, `partType`, `indexingFrequency`, initial-settled-rate, preliminary-exposure and source-reference fields are now modeled and exposed. |
| Detailed VPL weights and geometry | Input/output/scrap already existed. Thickness, tube OD, length, width, blanks, PLM/finish/forge-cast/offcut weights, yield, surface, bought-out, packaging, PP, talc and impact-modifier fields are now modeled and exposed. |
| Absolute or delta amendment entry | Now supported by governed price-change creation; old price is server-derived from the effective vendor price. |
| First, second and third amendment dates | Now modeled and exposed with chronological validation. |
| Buyer-selected approvers and two approval levels | Sequential two-step policy execution is implemented with immutable step/role evidence. Named buyer selection, threshold/DOA routing, delegation and skip rules remain explicit parity tasks. |
| Approval/rejection remarks and history | Covered; price and price-document UI now requires a user-entered remark and immutable approval records are visible. |
| Attachments in email | Replaced by an approved-records reference field. Binary storage/download needs an approved repository adapter; fragile email attachments will not be reproduced. |
| Mail approval links and reminders | In-app workflow exists. Secure notifications/reminders require an approved enterprise channel and identity design. |
| Excel upload/download templates | Preview-first bulk processing with row/column/field errors is still required; legacy blind upload behavior must not be copied. |
| Assembly/child/contract exception reports | Core linkage, BOM, impacted-part, finding and reconciliation evidence exists. Consolidated filters/exports remain to be completed. |
| CPAR/GDC/latest-rate/part-specific/rate-flow/grade-impact/weight reports | Pricing Workbench consolidates the core decision view. Formal parity mapping and export requirements need Product/Finance confirmation. |
| Historic RM base | Immutable versions and effective-dated records exist; dedicated historical-report UX remains a follow-on. |
| Admin logs and login log | Approval/System event logs are now visible. Login evidence belongs to the productive identity platform. |
| Pending-amendment and master-update dashboard | Executive dashboard is covered and materially improved. Reminder ageing and SLA drill-down remain follow-ons. |
| Provision module | Deterministic calculation, simulation, reversal and reconciliation exist. Productive posting remains gated. |

## Important field reconciliation

### Organization and commercial identity

Covered: company code, purchasing organization, purchasing group, plant, supplier/vendor, commodity, contract and item, material/assembly part, child BOM part, revision, price unit, UoM, currency, validity and source system.

Added from the legacy audit: VPL/part type, indexing frequency, initial settled rate/currency, preliminary-exposure indicator, Go-Fast/source reference, absolute/delta mode, additional amendment dates and repository/attachment reference.

### RM and composition detail

Covered: RM type, grade, subgrade, specification, classification, price index, input/output/scrap weight, yield, BOM quantity, BOM lineage, manual override reason and completeness.

Added from the legacy audit: minimum/maximum thickness, tube outside diameter, length, width, number of blanks, PLM weight, finish weight, forge/cast weight, offcut weight/percentage, scrap yield, surface area/UoM/process/cost, bought-out cost, packaging/terms cost, polypropylene content, talc percentage and impact modifier.

### Deliberately unresolved fields

- `PAN number` in the PDCA workbook is ambiguous and must be defined by the business before modeling.
- Legacy `validity` multipliers, `Plus-1`, `APV`, `RT`, `FCN`, `DOA`, `GDC` and `Go-Fast` semantics require signed definitions rather than inferred behavior.
- Separate scrap-price effective dates and surface-protection price masters need an approved master/rule design.

## Reported issue-control matrix

| ID | Reported legacy issue | Current prevention or required action | Status |
|---|---|---|---|
| LI-01 | CPAR jobs took up to 24 hours and combinations ran serially. | Priority queue, atomic claim, chunking, progress and failure state exist. Distributed parallel workers require productive persistence. | Trial control implemented; production scale gated |
| LI-02 | Report email generation failed on large attachments. | Use in-app/background download with stable IDs; do not depend on attachments. | Stable execution IDs implemented; report repository pending |
| LI-03 | Multi-plant/vendor/date execution produced wrong output. | Explicit scope, effective-date validation, immutable snapshots, duplicate-period rejection and reconciliation. | Implemented for trial scenarios |
| LI-04 | Uploaded contract list generated excess contracts. | Server-side contract validation and exact linkage allocation; future bulk preview must echo accepted/rejected rows. | Core control implemented; bulk preview pending |
| LI-05 | Retrospective amendments were split manually by date. | Effective-dated requests and deterministic period execution exist; multi-period orchestration remains a follow-on. | Partial |
| LI-06 | Plus-1 surplus quantities and APV were wrong. | Duplicate source-line constraint, reversal linkage and exact-decimal engine added; Plus-1 rule awaits signed definition. | Structural control implemented; rule pending |
| LI-07 | Reports required repeated manual filters and were slow to download. | Consolidated workbench and server queries exist; background export/download UX remains. | Partial |
| LI-08 | VPL total input weight did not recalculate after line changes. | Server-side weight validation, total recomputation, completeness and snapshot hash. | Implemented |
| LI-09 | Upload errors did not identify row, column and field. | New bulk design must validate before commit and persist exact cell diagnostics. | Pending T2 |
| LI-10 | Vendors had to be selected one by one. | Multi-vendor bulk selection/import is required with scoped preview. | Pending T2 |
| LI-11 | Login failed after identity/security changes. | Use supported IAS/XSUAA SSO and role collections, with operational monitoring. | Gate T3/productive identity task |
| LI-12 | Roles were manually assigned incorrectly. | Persona scopes and organizational attributes are declared; productive automated provisioning/delegation remains. | Partial/gated |
| LI-13 | New vendor creation required manual RMCM intervention. | Productive released S/4 supplier adapter/delta sync required. | Gate T3 integration task |
| LI-14 | SOPs/manuals were scattered. | Business handbook, acceptance checklist, handover and parity audit are repository-controlled. | Implemented |
| LI-15 | “Resource busy” blocked concurrent upload/report work. | Stateless request design and queued calculation isolate long work; bulk/report job queue remains to be added. | Partial |
| LI-16 | Approval email reports were unreadable. | In-app structured decision view and human-readable calculation trace. | Implemented |
| LI-17 | S/4 implementation caused duplicate/triplicate quantities. | Unique source-document line, reversal-aware processing, idempotency and reconciliation. | Implemented in canonical model |
| LI-18 | CPAR lacked the background report ID. | Run/proposal/posting/correlation IDs are visible in Controls & Audit. | Implemented |
| LI-19 | Duplicate grades/exposure lines proliferated. | RM Admin governance, unique master keys, effective linkage uniqueness and overlap rejection. | Implemented |
| LI-20 | Missing/delayed VPL caused missed provisions. | Linkage readiness, contract search, mandatory exception and dashboard findings. | Implemented |
| LI-21 | Approvals were delayed with no follow-up. | Pending worklists exist; SLA ageing and reminder adapter remain. | Partial |
| LI-22 | VPL contract number was optional. | A valid contract is selected and validated, or a documented exception requires approval. | Implemented with controlled exception |
| LI-23 | Dormant contracts/VPLs accumulated. | Validity closure, supersession and deletion markers exist; periodic review dashboard remains. | Partial |
| LI-24 | Buyers could not preview VPL before submission. | Current structured entry and selected-record display exist; explicit preview/diff confirmation remains. | Partial |
| LI-25 | Initial settled rate could not differ from current average rate. | Initial settled rate is now retained separately; amendment calculation use requires Finance confirmation. | Field implemented; calculation pending |
| LI-26 | Absolute/delta entry was inflexible. | Both modes now supported with server-derived proposed price and traceable delta. | Implemented |
| LI-27 | Date gaps, overwrites and extreme percentages lacked soft checks. | Validity/overlap/version checks exist; configurable percentage thresholds and DOA rules remain. | Partial |
| LI-28 | Colour-part donor VPL could not be carried over. | Revision-copy exists for compositions; governed donor-copy action remains to be designed. | Pending clarification |
| LI-29 | One attribute triggered separate approvals and rework. | Consolidated revision/request objects and sequential two-step policy execution are implemented; threshold/DOA, delegation and skip rules remain. | Core workflow implemented; advanced routing pending |
| LI-30 | Market index dashboard required external daily feeds. | Price-rule/index fields exist; no unapproved external or paid feed is introduced. | Gated by source/license/ADR |

## Improvements intentionally not copied

- Direct approval from unsecured email links.
- Buyer-level creation of uncontrolled RM types/grades.
- Physical deletion or overwrite of approved records.
- Static buyer-specific access that hides the governed master library.
- Long synchronous report processing.
- Email attachments as the system of record.
- Direct S/4 database/table access or unverified interfaces.

## Remaining parity backlog

1. Preview-first bulk import for RM grades, prices, linkages and amendments, with exact row/column/field diagnostics, accepted/rejected counts and downloadable error file.
2. Threshold/DOA routing, named approver selection, delegation, skip rules, ageing and secure reminders; sequential two-step policy execution is already implemented.
3. Background report/export jobs with filter snapshots, stable reference IDs, retry, expiry and centralized download.
4. Governed scrap, surface-protection, operation and other cost-element masters.
5. Finance-approved rule catalog for Plus-1, MASOP RM/BOP, offcut, scrap, surface protection, RT/APV and independent RM/scrap amendment dates.
6. Explicit preview/diff confirmation for VPL and amendments, plus donor/colour-part copy rules.
7. Consolidated report parity decision: identify which legacy reports remain legally/operationally required versus replaced by the Pricing Workbench.
8. Productive IAS/XSUAA provisioning, released supplier/contract/BOM/GR adapters, notification channel and approved records repository after the applicable gates.

## Decisions required

1. Are the legacy MASOP/offcut/surface-protection/scrap formulas authoritative, or only candidates pending Finance validation?
2. What exactly does `PAN number` mean in this business context, and what is its authoritative source?
3. Which legacy reports must remain separate named outputs, and which may be replaced by consolidated workbench filters and exports?
