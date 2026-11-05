# Raw Material Content Management

Trial-first SAP CAP application for vendor commodity-price changes, part raw-material content, retrospective GR impact, approvals, posting simulation and purchasing-contract price proposals.

The binding project rules are in [PROJECT_GUIDELINES.md](PROJECT_GUIDELINES.md). The current architecture is described in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

For a complete project handover, document map, new-laptop setup, and a copy-ready Codex continuation prompt, see [docs/HANDOVER.md](docs/HANDOVER.md).

For the pending human walkthrough and sign-off evidence, use [docs/ACCEPTANCE_REVIEW_CHECKLIST.md](docs/ACCEPTANCE_REVIEW_CHECKLIST.md).

The latest browser-based visual pre-review, before/after evidence and remaining human acceptance items are in [docs/VISUAL_REVIEW_REPORT.md](docs/VISUAL_REVIEW_REPORT.md).

The strict pages 1-38 reference re-audit, delivered capability mapping and intentional follow-ons are in [docs/REFERENCE_SCOPE_AUDIT.md](docs/REFERENCE_SCOPE_AUDIT.md).

The complete legacy RMCM manuals, field mappings and reported-issue comparison is in [docs/LEGACY_RMCM_PARITY_AUDIT.md](docs/LEGACY_RMCM_PARITY_AUDIT.md). It distinguishes implemented parity, safer replacement controls, gated production work and Finance decisions still required.

The read-only visual/interaction adoption from the user-supplied HTML proof of concept is documented in [docs/DESIGN_REFERENCE_ADOPTION.md](docs/DESIGN_REFERENCE_ADOPTION.md). No reference data, AI behavior, HANA assumption or unapproved integration was adopted.

For business presentations, training and role-based operating guidance, use the editable [RMC Application Business Handbook](docs/RMC_Application_Business_Handbook.pptx). Its repeatable source is [scripts/generate-rmc-handbook.js](scripts/generate-rmc-handbook.js).

For leadership review and architecture approval, use the separate editable [RMC Technical Architecture — Leadership Sign-off](docs/RMC_Technical_Architecture_Leadership_Signoff.pptx). Its repeatable source is [scripts/generate-technical-architecture-deck.js](scripts/generate-technical-architecture-deck.js).

## What is implemented

- Synthetic suppliers, contracts, parts, BOMs, GRs, RM types/grades and vendor prices
- Persona-led commodity and RM type/grade/subgrade governance with Buyer request and RM Admin approval
- Revisioned vendor-part-contract linkage and leaf-level composition weights
- Part raw-material profiles and constituent traceability
- Vendor commodity price-change workflow
- Buyer-created absolute or delta price requests with three amendment dates and retained source/attachment references
- Sequential two-level price approval with mandatory remarks and immutable step/role evidence
- Optimistic concurrency and approval audit records
- Asynchronous, priority-based retrospective calculation queue
- Exact decimal calculation with GR/reversal movement rules
- Configurable batch size, rounding, workflow and movement-type policies
- Calculation progress, exceptions and explanation
- Approval of completed calculations
- Idempotent MRNB-equivalent posting simulation
- Contract-price proposal generation
- Enriched retrospective-pricing workbench with commercial header, component cost sheet, impact equation, journey and workflow visualizations
- Blocked price-document release for simulation-only or amendment approval, plus impacted-part reporting
- SAPUI5 control tower with an animated executive Overview: price bridge, retrospective exposure, readiness, RM contribution and seven-stage journey visuals
- Dedicated Analytics Dashboard with clearly labelled synthetic 12-month price/index trends, supplier exposure, commodity benchmarks, workflow mix and monthly impact comparison
- Professional enterprise UI system with a native-height SAPUI5 shell, compact executive KPIs, restrained navy/blue hierarchy, consistent operational cards and dense business-friendly workspaces
- Responsive blue-purple worklists and administration UI with Master Data pulse cards, Commodity Price governance cards, a Pricing Workbench decision rail and reduced-motion accessibility
- Top-right demo persona switcher for Buyer, RM Admin, Commodity Admin and Approver views; it filters tabs, forms, fields and actions for walkthroughs but is explicitly not an authentication control
- Compact graphite application shell with collapsible persona-aware left navigation and a role-context workspace header
- Hardened light-on-dark styling and bounded responsive tables/forms with verified overflow protection at 1440×900 and 1366×768
- Health endpoint and Cloud Foundry trial manifest
- Executable Buyer linkage, valid-contract/no-contract exception and later-allocation workflow
- Recursive BOM hierarchy, revisioned leaf composition approval, workflow findings and reconciliation evidence
- Legacy-critical VPL classification, frequency, initial-rate, geometry, weight, scrap, surface and commercial attributes with server validation
- Source-document and calculation-line duplicate prevention plus a live legacy issue-control/audit matrix
- Lineage-linked trial calculation reruns and idempotent simulated-posting reversals

## Trial limitations

- No S/4HANA connection and no real posting
- Synthetic data only
- SQLite is in-memory, disposable and restricted to one Cloud Foundry instance
- The in-process worker is a demo adapter, not the final distributed worker
- Authentication uses CAP dummy authentication in the demo profile
- The SAPUI5 bootstrap is loaded from `ui5.sap.com`

## Run locally

Prerequisites: Node.js 22 or 24 and npm. The verified local toolchain is Node.js 22.23.3, SAP CAP 10.1.1 and `@cap-js/sqlite` 3.1.2.

```sh
npm install
npm run start:demo
```

Open `http://localhost:4004/rmc/webapp/index.html`.

Run tests:

```sh
npm test
```

Reset and reseed disposable demo data by restarting the application. The helper command prints the applicable instruction:

```sh
npm run reset:demo
```

## Deploy to an SAP BTP trial Cloud Foundry space

1. Log in with the Cloud Foundry CLI and target the trial org and space.
2. Review the application name, memory and route settings in `manifest.yml`.
3. Deploy:

```sh
cf push -f manifest.yml
```

The deployment intentionally uses one instance because each trial instance has its own in-memory SQLite database. Horizontal scaling is enabled only after shared, clean-core S/4-backed persistence and distributed job claims are implemented.

## Demo walkthrough

1. Open **Commodity Prices** and select `PCR-2026-0001`.
2. Submit and approve it. Self-approval is enabled only for the one-user demo.
3. Queue the retrospective calculation for its September validity period.
4. Open **Impact & Posting**. The worker processes two receipts and one reversal.
5. Approve the completed result and simulate posting.
6. Create a contract-price proposal.
7. Open **Administration** to adjust calculation batch size, rounding, or movement-type eligibility for future runs.

## Open business decisions

Before productive adapters are built, confirm the S/4 edition/FPS, Vistex version/configuration, precise MRNB accounting outcome, eligible movement types/date basis, BOM rules, formula/FX/rounding policies, approval authority, expected month-end volumes, and retention requirements.
