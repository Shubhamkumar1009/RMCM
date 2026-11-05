# Vistex Reference Scope Audit — Pages 1–38

## Audit boundary

- Audit date: **2026-11-01**
- Source: `artefacts/SAP Vistex Retro Pricing Automation for TML PV.pdf`
- Source length: **58 pages**
- Approved product-inspiration boundary: **pages 1 through 38 inclusive**
- Pages **39 through 58 were not reviewed or used** in this audit.

The first 38 pages were freshly extracted and visually rendered because many demonstration pages are screenshot-only and contain no usable PDF text layer. The audit compares business capabilities and information architecture; it does not copy proprietary Vistex screens, implementation details or data structures. `PROJECT_GUIDELINES.md` remains binding.

## Coverage assessment

| Pages | Reference theme | Current RMC coverage | Status / boundary |
|---|---|---|---|
| 1–7 | Product introduction, positioning, landscape, industries and customers | No transaction requirement was inferred from marketing/context pages. | Context only |
| 8 | Buyer/Finance operating model across maintenance, automation and insights | Persona-led SAPUI5 control tower, governed maintenance, calculation/approval, handoff, reconciliation and insights. | Covered |
| 9–10 | Component price structure and a worked part example | Server-calculated RM contribution, unchanged non-RM balance, current/proposed part price and retrospective impact. | Core covered; governed operation, transport, packaging, imported-content and other detailed cost-element masters remain optional follow-on scope |
| 11–12 | Seven-stage vision and holistic master/composition data | Master Data → Composition → RM Price → Cost Sheet → Simulate → Execute → Insights appears in Overview and Pricing Workbench. | Covered |
| 13–17 | RM master dashboard, search, detail, units, workflow and attachments | Commodity/RM type/grade/subgrade hierarchy, counts, search, validity, lifecycle, maker-checker requests and audit metadata. | Core covered; binary attachment/content-repository handling remains a governed future decision |
| 18–19 | Composition search and top-down cost BOM | Vendor-part-contract linkage, recursive BOM hierarchy, leaf mapping, input/output/scrap weights, revisioned composition, completeness findings and approval. | Covered and strengthened with immutable revision control |
| 20–22 | Revised RM-price maintenance and pricing areas | Supplier + RM type/grade/subgrade price revisions, old/proposed values, currency/UoM, validity and approval state. | Core covered; Tier-2 scope and advanced index/lag/FX/premium rules remain policy extensions |
| 23 | Retro-price amendment header and blocked status | Canonical price document with request, supplier/part, validity, commercial context, blocked/simulation/amendment state and approval actions. | Covered |
| 24–27 | Component cost-sheet calculation views | Approved composition, weights, old/new RM price, current/revised contribution, delta and human-readable trace are calculated on the server. | Covered |
| 28–30 | Revised-price lists and reviewer views | Commodity-price worklist, selected-price context, impacted parts and price-document state. | Covered for the trial; large-scale bulk maintenance remains a future capability |
| 31–33 | Detailed simulation/estimation tables | Impacted-part table, cost sheet, quantity × unit-delta equation and deterministic calculation evidence. | Core covered; full GR-line drill-down remains a future UX increment |
| 34 | Summary analytics and graphs | Executive dashboard, current/proposed comparison, readiness, exposure, contribution movement and governed journey. | Covered for scenario analytics; historical time-series trends require accepted data/retention scope |
| 35 | Approval workflow visualization | Version-safe workflow/execution timeline, roles, decision state, findings and controlled rework paths. | Core covered; delegation and multi-level threshold approval remain productive-design decisions |
| 36–37 | Execution stages and purchase-price retroaction | Simulation-only release, amendment approval, controlled contract-price handoff, posting simulation, reversal/rerun and reconciliation. | Trial covered; real posting and contract update are prohibited before Gate T3 and feasibility proof |
| 38 | Multi-level BOM pricing | Recursive BOM explosion, cycle/depth protection, leaf-only mapping and composition-driven pricing are implemented. | Covered in the synthetic trial; actual S/4 BOM semantics must be proven later |

## Current position

The confirmed trial persona backlog is complete in code. The application now covers the reference-inspired journey from governed master data through composition, revised RM price, cost sheet, simulation, approval, controlled execution evidence and reconciliation.

The following are intentional follow-on decisions rather than undisclosed defects:

1. Governed cost-element masters beyond RM and the current non-RM balance, including operation, overhead, transport, packaging, imported content and configured scrap recovery.
2. Advanced price formation such as index observation windows, lag, FX, premiums/discounts, floor/cap and multi-currency conversion.
3. Attachment storage and retention using an already-approved enterprise content repository.
4. Full GR-line drill-down, large-scale bulk maintenance, delegation and threshold-based multi-level approvals.
5. Historical trend analytics after volumes, retention and authoritative data sources are approved.
6. Real S/4 interfaces, posting and contract updates only after the transition gates and clean-core feasibility spikes.

Calculation Bucket/Run remains intentionally outside the confirmed near-term persona journey because approved outcomes hand off to the existing debit/provision automation. The calculation and rerun services remain available as trial evidence.

## Visual enrichment from this audit

The application retains its own blue-purple visual identity while adopting useful information patterns from the scoped reference:

- Master-data pulse cards for commodity, RM type, grade and subgrade hierarchy health.
- A richer Commodity Prices landing area showing request volume, approved revisions, selected movement and document/workflow state.
- A Pricing Workbench decision rail for source integrity, data quality, release path and financial exposure.
- Existing seven-stage journey, current/proposed cost composition, impact equation, workflow timeline and execution/reconciliation views.

These are original SAPUI5 components driven by the RMC canonical model and server results; they are not replicas of proprietary screens.
