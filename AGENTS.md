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

The trial now executes all confirmed persona journeys: Commodity Admin maintenance; Buyer RM-master request; RM Admin activation; Buyer vendor-part linkage and contract search; missing-contract approval and later allocation; recursive BOM hierarchy and leaf mapping; revisioned composition approval; subgrade-aware revised prices; impacted-part reporting; blocked price-document release/approval; workflow finding resolution/exclusion; and price reconciliation. Calculation Bucket/Run remains explicitly deferred because downstream debit/provision automation already exists.

The five-item persona backlog and remaining technical Trial Gate T1 reversal/rerun evidence are complete in code and live HTTP verification. The final fresh-process workflow smoke passed after authorization/read-only/advisory changes. The next step is user visual review of the new screens and recording feedback/acceptance decisions; automated local Edge capture produced no inspectable screenshot. BTP deployment remains deferred until explicitly requested.

Do not start productive S/4 integration. `PROJECT_GUIDELINES.md` prohibits real S/4 connectivity or real business data before formal Gate T3 approval.

## Last five interactions

1. **Committed and pushed the active laptop/agent handover baseline.** `origin/main` contains the application, verified evidence, transfer guide, continuation prompt and prioritized unfinished tasks through Gate T3.
2. **Completed Trial Gate T1 rerun/reversal evidence.** A new lineage-linked rerun reproduced INR 4,200, while simulated posting reversal retained immutable evidence and returned the same record on replay.
3. **Completed the final fresh-process workflow smoke.** Authorization gates, read-only projections, advisory exclusion, composition approval and matched price reconciliation passed together.
4. **Completed the remaining persona backlog.** Buyer linkage/contract search, no-contract approval/later allocation, recursive BOM leaf mapping, revisioned composition approval, findings, reconciliation and expanded authorization were implemented.
5. **Implemented Commodity Admin maintenance and theme contrast.** Governed commodity actions work end to end, and dark UI surfaces use explicit light foreground colors.

## Handover baseline contents

The committed and pushed handover baseline includes:

- `package-lock.json` - compatible dependency/security refresh.
- `.gitattributes` - cross-laptop LF normalization for source, data and documentation files.
- `app/rmc/webapp/view/App.view.xml` - themed dashboard hero and UI classes.
- `app/rmc/webapp/css/style.css` - purple-and-blue visual theme with explicit light foregrounds on dark surfaces.
- `app/rmc/webapp/Component.js` and `app/rmc/webapp/controller/App.controller.js` - workbench and persona-workflow state, loading and actions.
- `srv/rmc-service.cds` and `srv/rmc-service.js` - governed master, linkage, composition, findings, pricing and reconciliation actions.
- `srv/lib/pricing-workbench.js` and `test/pricing-workbench.test.js` - deterministic workbench calculation and golden test.
- `srv/lib/commodity-master.js` and `test/commodity-master.test.js` - Commodity Admin validation, lifecycle rules and unit tests.
- `srv/lib/workflow-domain.js`, `test/workflow-domain.test.js`, and `test/authorization-contract.test.js` - BOM, composition, scope and persona-gate coverage.
- `srv/lib/demo-posting-adapter.js` and `test/posting-adapter.test.js` - idempotent trial posting and reversal evidence.
- `docs/HANDOVER.md`, `docs/ACCEPTANCE_REVIEW_CHECKLIST.md`, `docs/PRICING_WORKBENCH_DESIGN.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/ARCHITECTURE.md`, and `README.md` - active transfer, acceptance, design and status documentation.
- `docs/PERSONAS_AND_FUNCTIONAL_SCOPE.md` - confirmed personas, field rules, process/state visualizations and acceptance priorities.
- `db/schema.cds`, governed master/linkage seed CSVs, and `xs-security.json` - persona-aware hierarchy, linkage, composition and price-document model.
- `AGENTS.md` - this continuity record.

The working tree should be clean after cloning or pulling `origin/main`. Re-check `git status` before editing and preserve any later user changes.

## Last verified baseline

- Verified locally on 2026-10-31 after completing the persona backlog and Trial Gate T1 rerun/reversal evidence.
- `npm.cmd test`: 14/14 tests passed.
- `npm.cmd run build`: production CAP build passed.
- `npm.cmd audit --omit=dev`: zero production vulnerabilities.
- App, health endpoint, OData metadata, and four Pricing Workbench query actions: HTTP 200.
- Live persona/workflow smoke test passed, then the in-memory demo was restarted to restore seed state.
- Live Commodity Admin create/close/mark/unmark smoke test passed with four audit records; the in-memory process was stopped afterward.
- Live linkage/exception/allocation/BOM/composition workflow and approved price reconciliation smoke tests passed on an isolated port 4005 instance.
- Final fresh-process smoke passed after persona-role annotations, read-only workflow projections and advisory-exception handling: excluded advisory remained excluded, direct linkage write returned HTTP 405, and reconciliation matched INR 2,265.
- Trial Gate T1 rerun/reversal smoke passed: original and rerun both produced 280 eligible units and INR 4,200; reversal replay returned the original reversal record.
- Automated DOM/screenshot capture with local Edge returned no output, so the new UI still needs user visual review. The isolated port 4005 process was stopped; the user's port 4004 process was not touched and must be restarted to load current code.
- Runtime remains `@sap/cds` 10.1.1; the compatible development kit resolved to 10.2.0 in the lockfile.

## Continuity maintenance

After each substantive development interaction, update this file before finishing:

- Keep only the five most recent meaningful user/assistant outcomes in **Last five interactions**.
- Update **Current continuation point**, **Handover baseline contents**, and **Last verified baseline** when they change.
- Record decisions and verified facts, not speculative plans.
- Keep this refresher concise; detailed requirements remain in the binding documents.
