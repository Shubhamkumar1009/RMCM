# Implementation Status

## Implemented trial vertical slice

- Standard CAP `app`, `db`, `srv`, `test` and deployment structure
- Synthetic S/4-like reference data and resettable in-memory demo storage
- RM type/grade, BOM, part profile, constituent, vendor-price and contract model
- Acceptable commodity and RM type/grade/subgrade hierarchy with validity, deletion marker and approval metadata
- Commodity Admin create, validity-close and reversible deletion-marker actions with optimistic concurrency and audit records
- Buyer vendor-part linkage creation, valid-contract search, missing-contract exception approval and later contract allocation
- Recursive effective-dated BOM hierarchy explosion with leaf-only RM mapping
- Revisioned composition creation, mapping, completeness findings, submission and immutable approval
- Mandatory/advisory workflow finding resolution or controlled exclusion, plus price-document reconciliation evidence
- Persona action gates, production organizational-scope checks and read-only governed workflow projections
- Buyer RM-master request submission and RM Admin approval that activates the requested master
- Revisioned vendor-part-contract linkage, contract-allocation/exception state and explicit input/output/scrap weights
- Vendor commodity-price request submission and approval
- Configured approval-role enforcement with demo-only self-approval
- Priority calculation queue with atomic claim, chunking, progress and exception capture
- Effective-dated supplier/part profile selection
- Configurable GR movement eligibility and reversal signs
- Exact decimal retrospective-impact calculation
- Calculation approval with unresolved-exception protection
- Idempotent posting simulation
- Explicit calculation-rerun lineage and immutable, idempotent simulated-posting reversal evidence
- Contract-price proposal generation
- Enriched pricing workbench derived from the approved first 38 reference pages
- Seven-stage master-to-insight journey and approval/execution visualizations
- Server-calculated component cost sheet with input/output/scrap weights, current/revised contributions and formula trace
- Current-versus-proposed cost composition and explicit eligible-quantity impact equation
- Impacted-part report derived from effective vendor-part linkage and approved composition
- Blocked price-document release for simulation-only or amendment approval, with version-safe Approver decision
- Administrator settings, movement rules, price rules and approval-policy UI
- Audit decisions, system events, health check and trial Cloud Foundry descriptors

## Verified baseline — 2026-10-19

- Node.js 22.23.3 and npm 10.9.9
- SAP CAP runtime 10.1.1, CAP development kit 10.1.0 and SQLite adapter 3.1.2
- CDS production build passes with a Node.js-only build task; no HANA deployer is generated
- Five domain/configuration unit tests pass
- Production dependency audit reports zero vulnerabilities (`npm audit --omit=dev`)
- Health, UI and OData metadata endpoints return HTTP 200
- Invalid administrator configuration returns HTTP 400
- End-to-end HTTP workflow passes: submit price change, approve, queue calculation, approve calculation, simulate posting and create contract-price proposal
- Verified demo result: 300 receipt units less 20 reversed units = 280 eligible units, INR 4,200 impact and contract price INR 2,250 to INR 2,265
- Posting replay returns the original posting record through its idempotency key

The latest CAP development kit retains npm advisories in development-only transitive packages. It is not a productive dependency; productive dependencies audit clean. Do not use `npm audit fix --force`, because npm proposes an incompatible CAP downgrade.

## Extended trial baseline — 2026-10-27

- Reviewed pages 1-38 of the approved retrospective-pricing reference PDF; no pages beyond 38 were used
- Added `docs/PRICING_WORKBENCH_DESIGN.md` with capability mapping, field catalog, formulas, visual flows and improvements beyond the reference
- Added four read-only workbench APIs for summary, component cost lines, comparison breakdown and impacted parts
- Verified golden preview: INR 2,250 current price, INR 15 unit delta, INR 2,265 proposed price, 280 eligible units and INR 4,200 retrospective impact
- Thirteen automated tests pass, covering cost-sheet calculation, Commodity Admin lifecycle, multi-level BOM/composition rules, organizational scope and persona action contracts
- SAPUI5 application renders successfully in a headless Chromium browser and all new workbench APIs return HTTP 200
- Persona requirements, state models and acceptance priorities are recorded in `docs/PERSONAS_AND_FUNCTIONAL_SCOPE.md`
- Live workflow smoke test passes: master approval creates a subgrade; price approval, simulation/amendment release and price-document approval complete with optimistic versions
- Live Commodity Admin smoke test passes: create, validity close, deletion mark and deletion-marker clear complete across versions 1-4 with four retained audit records
- Live linkage/composition smoke test passes: one valid contract found, no-contract exception approved, contract later allocated, two BOM nodes exploded and revision `B01.02` approved with no open mandatory findings
- Live reconciliation smoke test passes: approved INR 2,265 proposal matches the server-calculated INR 2,265 expected price with zero difference
- Approved amendment creates an INR 2,250 to INR 2,265 contract-price proposal in `DEMO_HANDOFF_READY`; no S/4 call or duplicate debit/provision automation is performed

## Final local verification — 2026-10-31

- Fresh-process linkage/composition/reconciliation smoke passed after the final authorization and finding changes: HTTP 200 endpoints, read-only write rejection HTTP 405, excluded advisory retained, approved composition and zero-difference price reconciliation.
- Trial Gate T1 rerun/reversal smoke passed: 280 eligible units and INR 4,200 impact, approved simulation, idempotent reversal replay, and a lineage-linked rerun that completed with the same INR 4,200 result.
- Fourteen automated tests, the production CAP build and SAPUI5 XML parsing pass.
- Manually review the new Buyer linkage, BOM hierarchy, composition, findings and reconciliation UI; automated Edge screenshot/DOM capture produced no inspectable output.
- Record user-review feedback and decisions before claiming formal Trial Gate T1 closure.
- BTP deployment and productive S/4 connectivity were intentionally not performed.

## Required before production

- Replace dummy authentication with IAS/XSUAA role collections
- Replace in-memory SQLite with approved clean-core S/4 extension services
- Implement released S/4 reference-data adapters
- Prove BOM explosion behavior against the real S/4 system
- Implement a shared durable job queue with leases and stale-worker recovery
- Extend amount ranges and organizational scopes across productive multi-step approval policies
- Replace trial contract search and BOM explosion adapters with verified released S/4 services
- Enforce the implemented persona and organizational gates through productive IAS/XSUAA assignments; trial dummy identity intentionally demonstrates every action
- Add governed scrap-price, operation-cost and non-RM cost-element masters; current trial shows the non-RM balance and treats scrap price as unconfigured
- Keep Calculation Bucket and Calculation Run out of the confirmed near-term scope; hand approved contract-price outcomes to the existing debit/provision automation
- Implement supported MRNB-equivalent posting and status/reversal inquiry
- Implement S/4 purchasing-contract update and Flexible Workflow status
- Add currency/UoM conversion services and signed Finance rules
- Add data migration, productive posting reconciliation, observability, security and load testing

## Current assumptions needing confirmation

1. Trial data may be entirely synthetic and reset whenever the application restarts.
2. One demo identity may submit and approve; this is disabled for production.
3. Price is expressed per one price unit unless configured otherwise.
4. Demo composition quantities are already normalized; yield and scrap are multiplicative factors.
5. Movement 101 adds quantity, while 102 and 122 subtract quantity.
6. Contract-price delta is calculated as approved run amount divided by eligible part quantity.
7. A price-change calculation period must remain inside its approved validity interval.
