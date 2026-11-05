# Codex Session Refresher

This file is the continuity record for the Raw Material Content Management (RMC) project. At the beginning of every new Codex session in this repository, read this file completely before inspecting or changing the project.

## Session-start checklist

1. Read this file completely.
2. Read `PROJECT_GUIDELINES.md`; it is the binding source of truth.
3. Read `docs/IMPLEMENTATION_STATUS.md` and `docs/ARCHITECTURE.md`.
4. Read the code relevant to the requested work. For workflow or calculation changes, start with:
   - `db/schema.cds`
   - `srv/rmc-service.cds`
   - `srv/rmc-service.js`
   - `srv/lib/calculation-worker.js`
   - `srv/lib/calculation-engine.js`
   - `app/rmc/webapp/controller/App.controller.js`
   - `app/rmc/webapp/view/App.view.xml`
   - the applicable files under `test/`
5. Inspect `git status` before editing. Existing changes belong to the user/current work and must be preserved.
6. Skip `artefacts/` and all of its contents unless the user explicitly brings it back into scope.

`docs/HANDOVER.md` is the active transfer guide because the user is preparing to switch laptop or AI agent. Keep it synchronized with this refresher until the transfer is complete.

## Current continuation point

The trial-first SAP CAP vertical slice works end to end with synthetic data. It includes price-change submission/approval, queued retrospective calculation, calculation approval, posting simulation, contract-price proposal generation, administration screens, and a demo SAPUI5 control tower.

An enriched retrospective Pricing Workbench is now implemented from the approved first 38 pages of the local reference PDF. It adds a seven-stage journey, canonical header/control fields, a server-calculated component cost sheet, comparison visualization, impact equation, and workflow/execution timeline. Confirmed persona ownership and functional rules are in `docs/PERSONAS_AND_FUNCTIONAL_SCOPE.md`; the reference mapping is in `docs/PRICING_WORKBENCH_DESIGN.md`.

On 2026-11-01 the complete 58-page reference PDF was re-audited with a strict pages 1-38 boundary: every scoped page was text-extracted, rendered and visually reviewed, while pages 39-58 were not inspected or used. `docs/REFERENCE_SCOPE_AUDIT.md` records the page-group mapping, delivered coverage, intentional follow-ons and current product position.

The trial now executes all confirmed persona journeys: Commodity Admin maintenance; Buyer RM-master request; RM Admin activation; Buyer vendor-part linkage and contract search; missing-contract approval and later allocation; recursive BOM hierarchy and leaf mapping; revisioned composition approval; subgrade-aware revised prices; impacted-part reporting; blocked price-document release/approval; workflow finding resolution/exclusion; and price reconciliation. Calculation Bucket/Run remains explicitly deferred because downstream debit/provision automation already exists.

The five-item persona backlog and remaining technical Trial Gate T1 reversal/rerun evidence are complete in code and live HTTP verification. The Overview is now an animated executive dashboard with a verified price bridge, retrospective-impact equation, readiness bars, RM contribution comparison and seven-stage journey. Values are derived from the server-calculated workbench and governed workflow state; the browser is not a financial calculation authority. Motion is restrained and disabled by `prefers-reduced-motion`.

The legacy RMCM application was fully audited on 2026-11-01 from the three user manuals, screen-wise field workbook and two reported-issue files explicitly placed in scope. All 190 unique embedded manual images and all nine issue slides were visually inspected. `docs/LEGACY_RMCM_PARITY_AUDIT.md` records capability/field parity, 30 issue-to-control mappings, deliberate improvements and the honest remaining backlog.

The trial now also supports governed absolute/delta price creation with three amendment dates, sequential two-level price approval with immutable step/role evidence, legacy-critical VPL and engineering/commercial attributes, duplicate source/calculation-line prevention, and a Controls & Audit UI. Disputed legacy financial formulas remain inactive pending signed Finance rules.

Browser review now covers 26 key states at both 1440×900 and 1366×768, including the corrected shell, aligned contribution bars, three analytics views and expanded/collapsed navigation. It confirms the modern shell, governed forms, audit evidence and four persona workspaces with no page errors, dark-surface findings or global/table overflow. The next step is human persona/legacy-parity review and recorded Product Owner, Purchasing and Finance decisions. BTP deployment remains deferred until explicitly requested.

While authentication remains dummy, the application now has a top-right trial-only persona selector for Buyer, RM Admin, Commodity Admin, Approver and All personas. It filters visible tabs, maker/decision forms and actions and returns to the selected persona’s default workspace. It is not an authorization control; CAP annotations and future IAS/XSUAA organizational enforcement remain authoritative. Responsive/contrast hardening adds explicit light foregrounds on dark surfaces and bounded internal table overflow.

The user-supplied `artefacts/RMCM Design POC/RMCM.html` was reviewed on 2026-11-01 strictly for design language and non-AI interaction patterns. No reference data or AI/HANA/feed/vendor-portal/posting assumption was adopted. The application now uses a compact graphite shell, collapsible persona-aware left navigation, workspace context header, neutral Fiori-like canvas and denser operational surfaces. The adoption boundary is recorded in `docs/DESIGN_REFERENCE_ADOPTION.md`; the reference returns to excluded artefact status.

The latest UI increment fixes the upper-left menu/logo collision and RM-mark contrast, aligns all Current/Proposed contribution bars, and adds a dedicated persona-visible Analytics Dashboard. It contains four KPIs, 12-month price/index movement, workflow mix, six-supplier exposure, six-commodity benchmarking and eight-month impact history. Those series are explicitly synthetic UX-review data; server-owned workbench results remain authoritative.

The application has now received a complete professional enterprise UI revamp. The shell uses native 3rem SAPUI5 header geometry to eliminate rail overlap, a simplified brand/persona layout, compact executive KPI cards, a restrained navy/blue hierarchy, consistent low-elevation work surfaces and standardized typography across every module. No workflow, authorization or server-calculation behavior changed.

A 44-slide editable business presentation and role-based user handbook is available at `docs/RMC_Application_Business_Handbook.pptx`. It uses the application blue-purple theme and covers the executive value story, verified trial metrics, before/after operating model, persona-capability matrix, end-to-end process, every available persona journey, financial value bridges, calculation and control behavior, demo scenario, data lineage, architecture, transition gates, success measures and open decisions. Regenerate it with `scripts/generate-rmc-handbook.js` after making material scope changes.

A separate 24-slide leadership architecture sign-off deck is available at `docs/RMC_Technical_Architecture_Leadership_Signoff.pptx`. It presents the current trial, proposed BTP/S/4 target, BTP service allow-list, deployment topology, integration and clean-core boundaries, data ownership, identity/SoD, connectivity options, scale, resilience, operations, cost governance, gates, risks, open decisions and a formal approval record. It deliberately preserves the no-HANA-Cloud baseline and labels Connectivity and other services as conditional. Regenerate it with `scripts/generate-technical-architecture-deck.js`.

Do not start productive S/4 integration. `PROJECT_GUIDELINES.md` prohibits real S/4 connectivity or real business data before formal Gate T3 approval.

## Last five interactions

1. **Published the complete project to GitHub.** Commit `edcc54f` containing 355 changed files was pushed to `origin/main` on 2026-11-05.
2. **Completed repository safety checks.** No sensitive filename or credential-pattern match was found; ignored artefacts, generated build output and dependencies were not committed.
3. **Verified the publication baseline.** 20/20 tests, the production CAP build and `npm audit --omit=dev` passed before the push.
4. **Retained the professional enterprise UI.** Native shell geometry, executive KPIs, analytics and standardized operational modules are included in the published baseline.
5. **Published transfer assets.** The business handbook, architecture sign-off deck, generators, handover documents and two-resolution visual evidence are included.

## Handover baseline contents

The current workspace handover set is committed to `origin/main`; the list below describes the published baseline:

- `package-lock.json` - compatible dependency/security refresh.
- `.gitattributes` - cross-laptop LF normalization for source, data and documentation files.
- `.gitignore` - local/runtime exclusions including transient Microsoft Office PowerPoint lock files.
- `app/rmc/webapp/view/App.view.xml` - professional executive and analytics dashboards, native-height shell, workbench and persona UI.
- `app/rmc/webapp/css/style.css` - enterprise navy/blue design system, corrected shell/bar geometry, consistent operational surfaces, responsive layout and dark-surface accessibility.
- `app/rmc/webapp/Component.js` and `app/rmc/webapp/controller/App.controller.js` - workbench/persona state, server-backed Overview visuals and labelled synthetic analytics presentation models.
- `srv/rmc-service.cds` and `srv/rmc-service.js` - governed master, linkage, composition, findings, pricing and reconciliation actions.
- `srv/lib/pricing-workbench.js` and `test/pricing-workbench.test.js` - deterministic workbench calculation and golden test.
- `srv/lib/commodity-master.js` and `test/commodity-master.test.js` - Commodity Admin validation, lifecycle rules and unit tests.
- `srv/lib/workflow-domain.js`, `test/workflow-domain.test.js`, and `test/authorization-contract.test.js` - BOM, composition, scope and persona-gate coverage.
- `srv/lib/demo-posting-adapter.js` and `test/posting-adapter.test.js` - idempotent trial posting and reversal evidence.
- `docs/HANDOVER.md`, `docs/ACCEPTANCE_REVIEW_CHECKLIST.md`, `docs/PRICING_WORKBENCH_DESIGN.md`, `docs/REFERENCE_SCOPE_AUDIT.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/ARCHITECTURE.md`, and `README.md` - active transfer, acceptance, reference-coverage, design and status documentation.
- `docs/RMC_Application_Business_Handbook.pptx` and `scripts/generate-rmc-handbook.js` - editable 44-slide business presentation/user handbook and its repeatable generator.
- `docs/RMC_Technical_Architecture_Leadership_Signoff.pptx` and `scripts/generate-technical-architecture-deck.js` - editable 24-slide BTP/S/4 architecture decision and leadership sign-off deck plus generator.
- `docs/VISUAL_REVIEW_REPORT.md`, `docs/review-evidence/` and `scripts/capture-ui-review.js` - browser-based UI review findings, before/after screenshots, machine-readable evidence and repeatable capture script.
- `docs/PERSONAS_AND_FUNCTIONAL_SCOPE.md` - confirmed personas, field rules, process/state visualizations and acceptance priorities.
- `docs/LEGACY_RMCM_PARITY_AUDIT.md` - complete legacy capability, field and reported-issue reconciliation with remaining decisions.
- `docs/DESIGN_REFERENCE_ADOPTION.md` - strict visual/interaction adoption boundary for the user-supplied HTML proof of concept.
- `test/legacy-parity-contract.test.js` - canonical legacy-critical field and duplicate-control contract tests.
- `test/persona-ui-contract.test.js` - persona selector and maker/approver UI-separation contract tests.
- `db/schema.cds`, governed master/linkage seed CSVs, and `xs-security.json` - persona-aware hierarchy, linkage, composition and price-document model.
- `AGENTS.md` - this continuity record.

The working tree should be clean after cloning or pulling `origin/main`. Re-check `git status` before editing and preserve any later user changes.

## Last verified baseline

- Verified locally on 2026-11-05 immediately before the GitHub publication.
- `npm.cmd test`: 20/20 tests passed.
- `npm.cmd run build`: production CAP build passed.
- `npm.cmd audit --omit=dev`: zero production vulnerabilities.
- App, health endpoint, OData metadata, and four Pricing Workbench query actions: HTTP 200.
- Live persona/workflow smoke test passed, then the in-memory demo was restarted to restore seed state.
- Live Commodity Admin create/close/mark/unmark smoke test passed with four audit records; the in-memory process was stopped afterward.
- Live linkage/exception/allocation/BOM/composition workflow and approved price reconciliation smoke tests passed on an isolated port 4005 instance.
- Final fresh-process smoke passed after persona-role annotations, read-only workflow projections and advisory-exception handling: excluded advisory remained excluded, direct linkage write returned HTTP 405, and reconciliation matched INR 2,265.
- Trial Gate T1 rerun/reversal smoke passed: original and rerun both produced 280 eligible units and INR 4,200; reversal replay returned the original reversal record.
- Playwright with local Microsoft Edge captured the professional 26-state route at 1440×900 and 1366×768. Evidence includes the native-height shell, executive KPIs, aligned contribution bars, analytics module, operational screens, collapsed navigation and all four persona workspaces; reports show no page errors, dark-surface contrast findings or global/table horizontal overflow. Human persona acceptance remains pending.
- The enriched business handbook passed native and package validation: PowerPoint opened and exported all 44 slides; the package contains 44 notes pages, 431 embedded vector visual assets, no negative shape extents and zero malformed XML parts.
- The technical architecture sign-off deck passed native and package validation: PowerPoint opened all 24 slides; the package contains 24 notes pages, zero malformed XML parts and no negative shape extents. Leadership approval remains pending.
- After the analytics/shell increment, `npm.cmd test` passed 20/20, the production build passed, `npm.cmd audit --omit=dev` found zero vulnerabilities and UI XML/JavaScript parsing passed.
- Runtime remains `@sap/cds` 10.1.1; the compatible development kit resolved to 10.2.0 in the lockfile.
- Main project commit `edcc54f` was pushed successfully to `origin/main` at `https://github.com/Shubhamkumar1009/RMCM.git`.

## Continuity maintenance

After each substantive development interaction, update this file before finishing:

- Keep only the five most recent meaningful user/assistant outcomes in **Last five interactions**.
- Update **Current continuation point**, **Handover baseline contents**, and **Last verified baseline** when they change.
- Record decisions and verified facts, not speculative plans.
- Keep this refresher concise; detailed requirements remain in the binding documents.

The user requires continuous handover maintenance. After every substantive change of any kind, always update `docs/HANDOVER.md` and the copy-ready continuation prompt in `FIRST_PROMPT.md` in the same interaction. The user must not need to repeat this instruction. Keep both files accurate about completed work, validation, uncommitted changes, continuation point and next actions.
