# RMC Project Handover

## Handover snapshot

Prepared on **2026-11-05** for continuation on another laptop or by another AI agent.

The Raw Material Content Management application is a working trial-first SAP CAP/SAPUI5 demo using synthetic data, dummy authentication, in-memory SQLite and simulated SAP posting. The complete confirmed persona backlog and the technical Trial Gate T1 rerun/reversal paths are implemented and verified locally.

This is not a productive implementation. No productive S/4 connection, real business data, BTP deployment or financially effective posting has been introduced.

## Continuous handover rule

The user requires this document and the root-level `FIRST_PROMPT.md` to be updated after every substantive project interaction. Future agents must maintain both automatically; the user should never need to repeat this instruction. Each update must reflect completed work, verification evidence, uncommitted changes, remaining tasks and the exact continuation point.

## GitHub transfer status

The handover baseline is committed and pushed to the `main` branch of:

```text
origin  https://github.com/Shubhamkumar1009/RMCM.git
```

The complete application, tests, documentation, decks, generators and visual evidence were published in main project commit `edcc54f` (`Complete RMC legacy parity, analytics, and professional UI`).

On the destination laptop, clone or pull `origin/main`, then confirm the latest commit contains this handover:

```powershell
git clone https://github.com/Shubhamkumar1009/RMCM.git
Set-Location 'RMCM'
git status --short
git log -1 --oneline
```

The working tree should be clean immediately after cloning. If it is not, inspect and preserve the unexpected changes before continuing.

`.gitattributes` fixes source/document files to LF so switching between Windows environments does not create line-ending-only diffs.
`.gitignore` excludes transient `~$*.pptx` Microsoft Office lock files so an open handbook does not pollute handover status.

## Required reading order

A new developer or AI agent must read these files before inspecting or editing code:

1. `AGENTS.md` — session continuity, current checkpoint and working-tree warning.
2. `PROJECT_GUIDELINES.md` — binding architecture, governance and safety rules.
3. `docs/HANDOVER.md` — this transfer guide.
4. `docs/IMPLEMENTATION_STATUS.md` — implemented and pending capabilities.
5. `docs/ACCEPTANCE_REVIEW_CHECKLIST.md` — human walkthrough and sign-off evidence.
6. `docs/ARCHITECTURE.md` — current and target architecture boundaries.
7. `docs/PERSONAS_AND_FUNCTIONAL_SCOPE.md` — confirmed personas and functional rules.
8. `docs/PRICING_WORKBENCH_DESIGN.md` — approved reference mapping and formulas.
9. `docs/REFERENCE_SCOPE_AUDIT.md` — strict pages 1-38 audit, coverage and intentional follow-ons.
10. `docs/LEGACY_RMCM_PARITY_AUDIT.md` — legacy capability, field and reported-issue reconciliation.
11. `docs/DESIGN_REFERENCE_ADOPTION.md` — modern-shell adoption boundary and excluded reference content.
12. `README.md` — quick local commands and overview.

When documents conflict, `PROJECT_GUIDELINES.md` is binding.

## Current capabilities

- Commodity Admin create, validity-close and reversible deletion-marker actions.
- Buyer RM-master requests and RM Admin activation of type/grade/subgrade masters.
- Buyer vendor-part linkage creation and valid-contract search.
- Missing-contract exception approval and later contract allocation.
- Recursive, effective-dated BOM hierarchy explosion with leaf-only RM mapping.
- Revisioned composition creation, completeness checks, submission and immutable approval.
- Mandatory/advisory workflow findings, controlled resolution and advisory exclusion.
- Subgrade-aware vendor price changes, impacted-part reporting and deterministic cost sheets.
- Buyer-created absolute/delta price requests with three amendment dates, retained references and overlap prevention.
- Sequential two-level price approval with mandatory remarks and immutable step/role/version evidence.
- Legacy-critical VPL classification, frequency, initial-rate, exposure, geometry, weight, scrap, surface and commercial attributes with server validation.
- Duplicate source-document-line and calculation-line prevention.
- Controls & Audit UI with a twelve-item legacy control matrix, approval history and correlation references.
- Blocked/simulation/amendment price-document release and Approver decision.
- Approved contract-price proposal and downstream handoff evidence.
- Exact decimal retrospective calculation against synthetic GR and reversal quantities.
- Idempotent posting simulation, immutable simulated-posting reversal and replay protection.
- Lineage-linked calculation reruns that do not overwrite the source run.
- Price-document reconciliation with expected, actual and difference evidence.
- Persona action annotations, productive organizational-scope checks and read-only governed projections.
- Themed SAPUI5 control tower with an executive Overview: verified price bridge, retrospective-impact equation, operational-readiness bars, RM contribution comparison and seven-stage journey.
- Master Data pulse cards, Commodity Price governance cards and a Pricing Workbench decision rail derived from loaded governed state.
- Responsive card/chart animation, hover feedback and explicit `prefers-reduced-motion` accessibility, with light text on dark surfaces.
- Top-right trial persona selector for Buyer, RM Admin, Commodity Admin, Approver and All personas, filtering tabs, forms and actions without pretending to replace authentication.
- Compact graphite shell, collapsible persona-aware left navigation and role-context workspace header adopted from the user-supplied HTML design reference.
- Corrected menu/product-mark spacing, high-contrast white `RM` initials and grid-aligned Current/Proposed comparison bars.
- Persona-visible Analytics Dashboard with four KPIs, 12-month price/index movement, workflow mix, six-supplier exposure, six-commodity comparison and eight-month impact history; all expanded analytical series are labelled synthetic UX-review data.
- Professional enterprise design system across all modules: native-height shell geometry, simplified brand/persona chrome, compact executive KPIs, restrained navy/blue hierarchy, consistent typography, low-elevation work surfaces and standardized operational cards/forms/tables.
- Responsive contrast/overflow hardening with explicit light foregrounds on dark gradients, container-bounded forms/cards and internal table scrolling.

The 58-page reference PDF was re-audited on 2026-11-01 under the user-mandated boundary. All pages 1-38 were text-extracted, rendered and visually reviewed; pages 39-58 were not inspected or used. `docs/REFERENCE_SCOPE_AUDIT.md` records the detailed capability mapping and intentional follow-ons.

The explicitly authorized legacy application audit covered all three user manuals, the screen-wise field workbook and both reported-issue artifacts. All 190 unique embedded manual images and all nine issue slides were visually inspected. `docs/LEGACY_RMCM_PARITY_AUDIT.md` is the authoritative parity record. The artefacts folder returns to out-of-scope status unless the user explicitly brings it back.

The user also explicitly authorized a design-only review of `artefacts/RMCM Design POC/RMCM.html`. Only shell, navigation, hierarchy and responsive interaction patterns were adopted. No sample data, AI feature, HANA Cloud assumption, external feed, vendor portal or automatic posting claim was copied. `docs/DESIGN_REFERENCE_ADOPTION.md` records the exact disposition; the HTML returns to excluded artefact status.

Calculation Bucket/Run remains outside the confirmed user journey because approved outcomes hand off to existing debit/provision automation. The existing calculation service is retained for trial evidence and is hidden from the primary UI.

## Last verified baseline

Verified locally on 2026-11-05 before GitHub publication:

- Node.js `22.23.3`; npm `10.9.9`.
- SAP CAP runtime `10.1.1`; development kit resolved to `10.2.0` in the lockfile.
- `npm.cmd test`: **20/20 passed**.
- `npm.cmd run build`: passed; Node.js-only CAP build, no HANA deployer.
- `npm.cmd audit --omit=dev`: zero production vulnerabilities.
- Analytics/shell correction was followed by a fresh 20/20 test run, production build, XML/JavaScript parsing and zero-vulnerability production audit.
- SAPUI5 XML view parsing: passed.
- Health, UI and OData metadata endpoints: HTTP 200.
- Direct write to governed `VendorPartLinkages`: HTTP 405 as designed.
- Linkage/exception/later-allocation/BOM/composition workflow: passed.
- Advisory exclusion remained `EXCLUDED` through submission and approval.
- Price proposal reconciliation: expected INR 2,265, actual INR 2,265, difference zero.
- Calculation result: 300 receipt units less 20 reversal units = 280 eligible units; INR 4,200 impact.
- Posting reversal replay returned the existing reversal record.
- Lineage-linked rerun completed with the same INR 4,200 result.
- Live smoke verified DELTA price creation (INR 220 to INR 225.50), three amendment dates, one system event and sequential SUBMITTED → UNDER_REVIEW → APPROVED decisions across RmcEditor, RmcApprover and RmcFinance.
- Edge/Playwright visual review captured the superseding professional 26-state route at both 1440×900 and 1366×768. Evidence covers the native-height shell, compact KPIs, aligned bars, analytics views, operational modules, expanded/collapsed navigation and all four persona workspaces; there are no page errors, dark-surface contrast findings or global/table horizontal overflow.

The isolated verification process on port 4005 was stopped. A fresh disposable demo containing the enriched dashboard is running locally on port 4004 for user review.

The presentation handbook was enriched and validated natively in Microsoft PowerPoint. PowerPoint opened and exported all 44 slides successfully. The package contains 44 notes pages, 431 embedded vector assets, zero negative shape extents and zero malformed XML parts. Representative executive, process, matrix, verified-data, section, financial-bridge, boundary and closing slides were visually inspected from the native 1600×900 render.

A separate leadership architecture deck is now available at `docs/RMC_Technical_Architecture_Leadership_Signoff.pptx`. Its 24 slides cover the architecture decision, current trial, target BTP/S/4 landscape, deployment topology, allow-listed/conditional/excluded BTP services, request flow, S/4 ownership, candidate interfaces, ports/adapters, data, security, connectivity, workflow authority, scale, resilience, operations, FinOps, delivery gates, risks, open decisions and a sign-off record. PowerPoint opened all 24 slides; the package has 24 notes pages, zero malformed XML parts and no negative shape extents.

## What remains

### Immediate next step

Use `docs/VISUAL_REVIEW_REPORT.md` and `docs/ACCEPTANCE_REVIEW_CHECKLIST.md` for the human persona walkthrough. Use `docs/RMC_Technical_Architecture_Leadership_Signoff.pptx` for the architecture leadership session and record named Product/Business, Purchasing, Finance, Security, S/4 Architecture and BTP Platform/Operations decisions. The deck recommends conditional approval and explicitly does not authorize deployment or S/4 connectivity.

During the walkthrough, use the top-right **View as** selector for each confirmed persona and verify the displayed forms/actions against business ownership. Record that this is a demo visualization control only; it does not authorize the selected role.

### Trial Gate T2 preparation

- Complete field-level reviews with Product Owner, Purchasing and Finance.
- Compare the accepted demo scenarios with approved, anonymized current-process examples.
- Confirm formulas, rounding, UoM/currency rules, workflows, reports and approval authority.
- Resolve or explicitly retain the open business questions in `PROJECT_GUIDELINES.md`.
- Agree the weighted product-definition scope and acceptance evidence.

### Explicit legacy-parity backlog

1. Preview-first bulk imports with downloadable exact row, column and field diagnostics.
2. Background report/export jobs and a centralized download repository with stable IDs.
3. Threshold/DOA routing, named approver selection, delegation, skip rules, ageing and secure reminders; sequential two-step execution is complete.
4. Governed scrap-price, surface-process, operation-cost and non-RM cost-element masters.
5. Signed Finance rules for Plus-1, MASOP, offcut, scrap, surface protection, RT/APV and independent effective dates.
6. Explicit VPL preview/diff behavior and the decision on donor colour-part rules.
7. Business decision on which legacy reports remain separate named outputs versus consolidated workbench filters/exports.
8. Productive IAS/XSUAA and released S/4 adapters only after the applicable gates.
9. Clarification of the legacy “PAN number” field and whether it belongs in the canonical model.

### Intentionally not done

- BTP trial deployment; the user will explicitly request it later.
- Productive or non-production S/4 connectivity.
- Real supplier, price, BOM, GR or personal data.
- Productive IAS/XSUAA role assignments and organizational attributes.
- Released S/4 contract/BOM/material-document adapters.
- Supported MRNB-equivalent posting, S/4 contract update or Flexible Workflow integration.
- Productive persistence, distributed queue, monitoring, migration, load/security testing and operations runbook.

No real S/4 connectivity or real business data is permitted before formal Gate T3 approval.

## New-laptop setup

Install Git, VS Code and Node.js 22 or 24. Then:

```powershell
git clone https://github.com/Shubhamkumar1009/RMCM.git
Set-Location 'RMCM'
npm.cmd ci
npm.cmd test
npm.cmd run build
npm.cmd run start:demo
```

Open:

```text
http://localhost:4004/rmc/webapp/index.html
```

Stop the demo with `Ctrl+C`. Its in-memory database resets on restart. `npm.cmd` avoids PowerShell execution-policy issues with `npm.ps1`.

If the current changes were transferred as a workspace archive instead of Git, open that exact folder and run `npm.cmd ci` before testing.

## Repository map

| Path | Responsibility |
|---|---|
| `app/rmc/webapp` | Freestyle SAPUI5 UI, theme, models and workflow actions. |
| `db/schema.cds` | Canonical trial domain model and future S/4 extension contract. |
| `db/data` | Synthetic, resettable seed data. |
| `srv/rmc-service.*` | Governed OData actions, invariants, workflow, versioning and audit records. |
| `srv/admin-service.*` | Controlled trial configuration maintenance. |
| `srv/lib/calculation-engine.js` | Pure deterministic decimal calculations. |
| `srv/lib/calculation-worker.js` | In-process trial calculation worker. |
| `srv/lib/pricing-workbench.js` | Current-versus-proposed cost sheet and impact preview. |
| `srv/lib/commodity-master.js` | Commodity validation and lifecycle rules. |
| `srv/lib/workflow-domain.js` | BOM explosion, composition assessment and scope rules. |
| `srv/lib/demo-posting-adapter.js` | Idempotent simulation/reversal; never calls SAP. |
| `test` | Twenty automated domain, workflow, authorization, UI-contract and adapter tests. |
| `test/requests.http` | Read-only health, workbench, contract, BOM and evidence requests for manual smoke checks. |
| `docs/ACCEPTANCE_REVIEW_CHECKLIST.md` | Human UI/process review and Gate T1/T2 decision template. |
| `docs/VISUAL_REVIEW_REPORT.md` | Agent visual pre-review, corrected defects, evidence index and human-review boundary. |
| `docs/DESIGN_REFERENCE_ADOPTION.md` | Approved design-only adoption from the HTML reference, including copied patterns and explicit exclusions. |
| `docs/REFERENCE_SCOPE_AUDIT.md` | Strict pages 1-38 source audit, delivered coverage and intentional follow-ons; pages 39-58 excluded. |
| `docs/review-evidence` | Before/after Edge screenshots and machine-readable browser-review evidence. |
| `docs/RMC_Application_Business_Handbook.pptx` | 44-slide executive business deck and detailed role-based user handbook with verified-data and financial visuals. |
| `scripts/generate-rmc-handbook.js` | Repeatable PowerPoint generator; requires `pptxgenjs` and Font Awesome packages. |
| `docs/RMC_Technical_Architecture_Leadership_Signoff.pptx` | 24-slide leadership decision deck for the proposed BTP/S/4 technical architecture and formal sign-off. |
| `scripts/generate-technical-architecture-deck.js` | Repeatable architecture deck generator using editable presentation-native shapes and vector icons. |
| `scripts/capture-ui-review.js` | Repeatable Microsoft Edge/Playwright capture for key acceptance screens. |
| `FIRST_PROMPT.md` | Always-current copy-ready prompt for the first message to another AI agent. |
| `server.js` | CAP bootstrap, health endpoint and trial worker startup. |
| `manifest.yml`, `mta.yaml` | Trial Cloud Foundry descriptors; not yet deployed in this phase. |
| `xs-security.json` | Declared future productive scopes and role templates. |

## Working-tree summary

The committed handover baseline includes the UI theme/workbench, persona workflow models and actions, schema and seed extensions, security roles, pricing/commodity/workflow libraries, tests, dependency lockfile and documentation.

Main project commit `edcc54f` contains the presentation decks/generators, continuity files, strict reference and legacy parity work, professional enterprise UI revamp, corrected shell/bar geometry, synthetic Analytics Dashboard, browser script/evidence/report, persona selector, responsive/contrast hardening, schema/service/UI changes, approval policy and contract tests. It was pushed to `origin/main` on 2026-11-05. A fresh clone should have a clean working tree.

Always run `git status --short` before editing. Preserve all existing changes; do not reset, checkout or overwrite them.

## Non-negotiable boundaries

- Synthetic or irreversibly anonymized data only in the trial.
- No S/4 table access, unreleased API dependency, SAP GUI automation or productive posting.
- Clean-core released APIs/services only after the applicable transition gate.
- No HANA Cloud in the binding baseline.
- Exact decimal financial logic; never use binary floating point for money or quantities.
- Approved data is immutable; corrections use reversal, supersession or a new version.
- Preserve idempotency, optimistic concurrency, maker-checker controls, audit evidence and calculation explainability.
- Do not use `npm audit fix --force`; it proposes an incompatible CAP downgrade for development-only advisories.
- Skip `artefacts/` unless the user explicitly brings it into scope.

## Copy-ready AI continuation prompt

The authoritative copy-ready prompt is maintained separately in [`FIRST_PROMPT.md`](../FIRST_PROMPT.md), as requested by the user. Copy the fenced block from that file as the first message to another AI agent. Update it together with this handover and `AGENTS.md` after every substantive interaction.

## Unfinished tasks

### Transfer prerequisite

1. Clone or pull the latest `origin/main` and confirm the working tree is clean before editing.
2. Verify `docs/HANDOVER.md` contains the 2026-11-01 snapshot.
3. Verify 20/20 tests, the production build and the zero-vulnerability production audit before continuing.

### Immediate product-review work

1. Agent pre-review and dashboard-enrichment review are complete in `docs/VISUAL_REVIEW_REPORT.md`; retain all before/after and two-resolution evidence.
2. Product Owner, Purchasing and Finance must perform the human functional walkthrough in `docs/ACCEPTANCE_REVIEW_CHECKLIST.md`.
3. Review business terminology, action sequencing, exception language, formulas and acceptance evidence rather than repeating the already-verified layout checks.
4. Record every user observation as accept/change/defer/reject with an owner and acceptance criteria.
5. Correct any further defects discovered during human review and rerun the complete automated and live smoke baseline.

### Architecture leadership sign-off

1. Present `docs/RMC_Technical_Architecture_Leadership_Signoff.pptx` to Product/Business, Purchasing, Finance, Security, S/4 Architecture and BTP Platform/Operations leadership.
2. Record approve, conditional approval, rework or reject plus named conditions, owners and dates on the final slide or in the approved records repository.
3. Confirm the minimum BTP allow-list and that HANA Cloud/additional paid services remain excluded unless a costed ADR is approved.
4. Assign owners and target gates to the landscape, posting, BOM/GR, pricing, workflow, records, network and operations decisions.
5. Treat sign-off as architecture direction only; BTP deployment still requires explicit user instruction and real-landscape work remains prohibited before Gate T3.

### Formal Trial Gate T1 closure

1. Record Product Owner, Purchasing and Finance feedback against the demonstrated journeys.
2. Confirm the synthetic exception, rejection, corrective rework, reversal, rerun and reconciliation evidence is accepted.
3. Record any remaining acceptance gaps rather than treating them as implicitly approved.
4. Decide formally whether Trial Gate T1 can close.

### Trial Gate T2 scope convergence

1. Complete field-level and user-journey reviews with the confirmed personas.
2. Compare the demo with approved, anonymized examples from the scoped current Vistex process.
3. Confirm formulas, price units, UoM/currency conversion, rounding, eligible movements/date basis, approval authority, reports and reconciliation expectations.
4. Resolve or retain explicitly the open decisions OQ-01 through OQ-15 in `PROJECT_GUIDELINES.md`.
5. Agree the weighted product-definition baseline and determine whether at least 90% is accepted.
6. Confirm the remaining backlog has no unresolved architectural, accounting, security or integration blocker before requesting Gate T3.

### Deferred until explicit approval

1. Deploy to the BTP trial account only when the user explicitly requests it and supplies/targets the correct trial org and space.
2. Do not connect to any real S/4 system or load real business data before formal Gate T3 approval.
3. After Gate T3, plan IAS/XSUAA assignments, released S/4 adapters, clean-core S/4 persistence, durable job processing, supported MRNB-equivalent posting, contract update/Flexible Workflow, migration, monitoring and security/load testing.

### Review boundary

Automated Microsoft Edge capture now works and has produced inspectable evidence. It cannot provide Product Owner, Purchasing or Finance acceptance, validate business terminology against the current Vistex process, or close Trial Gate T1; those remain human decisions.
