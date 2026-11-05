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
- Executive Overview dashboard with server-backed price bridge, exposure equation, readiness indicators, RM contribution bars and seven-stage journey
- Responsive card/chart motion with hover feedback and `prefers-reduced-motion` accessibility
- Master Data pulse cards, Commodity Price governance cards and a Pricing Workbench decision rail derived from loaded application/workflow state
- Impacted-part report derived from effective vendor-part linkage and approved composition
- Blocked price-document release for simulation-only or amendment approval, with version-safe Approver decision
- Administrator settings, movement rules, price rules and approval-policy UI
- Audit decisions, system events, health check and trial Cloud Foundry descriptors

## Verified baseline — 2026-10-19

- Node.js 22.23.3 and npm 10.9.9
- SAP CAP runtime 10.1.1, CAP development kit 10.1.0 and SQLite adapter 3.1.2
- CDS production build passes with a Node.js-only build task; no HANA deployer is generated
- Fourteen domain, workflow, authorization, calculation and adapter tests pass
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
- Fourteen automated tests pass, covering cost-sheet calculation, Commodity Admin lifecycle, multi-level BOM/composition rules, organizational scope, posting reversal and persona action contracts
- SAPUI5 application renders successfully in automated Microsoft Edge review and all new workbench APIs return HTTP 200
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
- Browser pre-review of nine key screens is complete. It corrected desktop navigation truncation, automatic BOM hierarchy initialization and raw composition precision; before/after evidence is retained in `docs/review-evidence/`.
- Dashboard enrichment review captured eleven key states at both 1440×900 and 1366×768. The new analytics remain readable without page/table overflow or browser page errors; evidence is retained in `docs/review-evidence/ui-2026-10-31-dashboard-*`.

## Reference re-audit and visual enrichment — 2026-11-01

- Re-audited the 58-page source with a strict pages 1-38 boundary. Every scoped page was text-extracted, rendered and visually inspected; pages 39-58 were not inspected or used.
- Recorded delivered coverage, current position and intentional follow-ons in `docs/REFERENCE_SCOPE_AUDIT.md`.
- Added visually governed Master Data, Commodity Price and Pricing Workbench decision components without moving financial authority into the browser.
- Captured thirteen key states at both 1440×900 and 1366×768 with no browser page errors, global horizontal overflow or measured table overflow. Evidence is retained in `docs/review-evidence/ui-2026-11-01-reference-enrichment-*`.
- A separate 24-slide technical architecture leadership sign-off deck now documents the current trial, lean BTP target, S/4 ownership, service decisions, security, integration, scale, resilience, operations, cost controls, gates, risks and approval record. Native PowerPoint and package validation passed.
- Complete Product Owner, Purchasing and Finance review of the Buyer linkage, BOM hierarchy, composition, findings and reconciliation journeys using the acceptance checklist.
- Record user-review feedback and decisions before claiming formal Trial Gate T1 closure.
- BTP deployment and productive S/4 connectivity were intentionally not performed.

## Legacy RMCM parity increment — 2026-11-01

- Fully reviewed the three legacy user manuals, screen-wise field workbook and two reported-issue files under `artefacts/Old RMCM Application`; all 190 unique manual images and all nine issue slides were visually inspected.
- Added `docs/LEGACY_RMCM_PARITY_AUDIT.md` with the capability inventory, field reconciliation, 30 issue-to-control mappings, safer replacement decisions and transparent remaining backlog.
- Added governed absolute/delta price-request creation, three amendment dates, repository/source references, overlap prevention and server-derived effective old price.
- Implemented sequential two-step price approval with policy-selected roles, mandatory decision remarks, optimistic versions and immutable step/role audit evidence.
- Added legacy-critical VPL classification, frequency, initial settled rate, preliminary exposure and source reference, plus engineering/commercial composition attributes and server validation.
- Added unique source-document-line and calculation-line constraints to prevent duplicate quantities and repeated calculation exposure.
- Added a live Controls & Audit area showing legacy issue controls, immutable approval history and background/correlation references without overstating incomplete work.
- Sixteen automated tests pass; production build, UI XML/JavaScript parsing and `npm audit --omit=dev` pass with zero production vulnerabilities.
- Eighteen UI states were captured at both 1440×900 and 1366×768. Reports show no page errors, global overflow or measured table overflow; only the expected development `Component-preload.js` miss is logged.
- Legacy MASOP, Plus-1, offcut, scrap, surface-protection, RT and APV formulas were deliberately not activated pending signed Finance rules.

## Persona visualization and responsive UI hardening — 2026-11-01

- Added a top-right **View as** selector for All personas, Buyer, RM Admin, Commodity Admin and Approver while trial authentication remains dummy.
- Persona selection filters tabs, entry forms, fields and actions: Buyer receives maker flows; RM Admin receives RM activation decisions; Commodity Admin receives commodity lifecycle controls; Approver receives exception/composition/price decisions without maker forms.
- Selection returns the user to the top of the persona’s default workspace and retains the permanent demo/no-S/4 warning.
- The selector is visualization only; CAP annotations remain the current service contract and future IAS/XSUAA plus organizational scope remains the productive authorization boundary.
- Corrected dark-surface foreground rules for text, icons, statuses and numbers; constrained cards/forms and added internal table overflow boundaries.
- Added three UI contract tests covering persona switching, maker/approver separation, collapsible navigation and explicit AI exclusion. The complete suite now passes 19/19.
- The superseding modern-shell route captures 23 states at both 1440×900 and 1366×768 with zero page errors, dark-surface findings, global horizontal overflow or measured table overflow.

## Modern shell and UX adoption — 2026-11-01

- Reviewed the user-supplied `artefacts/RMCM Design POC/RMCM.html` strictly as a visual and interaction reference.
- Added a compact graphite shell, product mark, persistent collapsible side navigation, selected-state rail and persona workspace header.
- Restyled operational pages with a neutral Fiori-like canvas, white work surfaces, restrained borders/shadows, compact radii and clearer page hierarchy while retaining blue-purple governed dashboards.
- Preserved real SAPUI5 behavior for navigation, persona filtering, expandable forms, searches, worklists and workflow decisions; no decorative mock controls were added.
- Wrapped long action groups, retained internal table overflow boundaries and preserved light foregrounds on dark surfaces.
- Did not copy reference business data or adopt AI suggestions, live market/forex feeds, HANA Cloud, vendor portal scope or automatic productive posting.
- Added a UI contract check for the collapsible side navigation and explicit absence of AI features; the complete suite passes 19/19.
- Captured 23 states at both 1440×900 and 1366×768 with no page errors, dark-surface findings, global overflow or measured table overflow.
- Full responsive evidence and final verification are recorded in `docs/VISUAL_REVIEW_REPORT.md`.

## Analytics dashboard and UI correction — 2026-11-01

- Corrected the upper-left shell collision by matching header/rail geometry, separating the menu and product mark, and enforcing high-contrast white `RM` initials.
- Rebuilt the RM contribution rows with fixed label/value columns and a shared flexible track so Current and Proposed bars align exactly.
- Added a persona-visible Analytics Dashboard module with four KPI cards, 12-month part-price/index columns, workflow distribution, six-supplier exposure, six-commodity normalized comparison and eight-month retrospective-impact history.
- All analytical history and portfolio values are explicitly synthetic presentation data; governed price and impact authority remains in the server-calculated workbench.
- Extended browser capture to 26 states at both 1440×900 and 1366×768. Both reports show zero page errors, dark-surface findings, global overflow and table overflow.
- Added an analytics UI contract test. The complete suite passes 20/20; production build and `npm audit --omit=dev` also pass.

## Professional enterprise UI revamp — 2026-11-01

- Replaced the prototype-like Overview tiles with four compact executive KPI cards and a clearer pricing command-center hierarchy.
- Rebuilt the shell brand lockup, removed duplicated persona chrome and fixed the corner overlap at its source by matching the toolbar to SAPUI5's native 3rem header slot.
- Standardized the complete application on restrained navy/blue surfaces, neutral canvas, low-elevation cards, consistent typography, tighter radii and quieter status treatment.
- Applied the same system to Overview, Analytics, Master Data, Commodity Prices, Pricing Workbench, Part RM Content, Controls & Audit and Administration without changing workflow behavior.
- Replaced the remaining high-saturation exposure and workflow panels with controlled navy/blue decision surfaces.
- Captured the complete 26-state route at 1440×900 and 1366×768. Both reports show zero page errors, dark-surface findings, global overflow and visible-table overflow.
- Automated tests remain 20/20; UI XML/JavaScript parsing, production CAP build and the production dependency audit pass.

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
