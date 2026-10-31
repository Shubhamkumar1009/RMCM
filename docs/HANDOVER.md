# RMC Project Handover

## Handover snapshot

Prepared on **2026-10-31** for continuation on another laptop or by another AI agent.

The Raw Material Content Management application is a working trial-first SAP CAP/SAPUI5 demo using synthetic data, dummy authentication, in-memory SQLite and simulated SAP posting. The complete confirmed persona backlog and the technical Trial Gate T1 rerun/reversal paths are implemented and verified locally.

This is not a productive implementation. No productive S/4 connection, real business data, BTP deployment or financially effective posting has been introduced.

## GitHub transfer status

The handover baseline is committed and pushed to the `main` branch of:

```text
origin  https://github.com/Shubhamkumar1009/RMCM.git
```

On the destination laptop, clone or pull `origin/main`, then confirm the latest commit contains this handover:

```powershell
git clone https://github.com/Shubhamkumar1009/RMCM.git
Set-Location 'RMCM'
git status --short
git log -1 --oneline
```

The working tree should be clean immediately after cloning. If it is not, inspect and preserve the unexpected changes before continuing.

`.gitattributes` fixes source/document files to LF so switching between Windows environments does not create line-ending-only diffs.

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
9. `README.md` — quick local commands and overview.

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
- Blocked/simulation/amendment price-document release and Approver decision.
- Approved contract-price proposal and downstream handoff evidence.
- Exact decimal retrospective calculation against synthetic GR and reversal quantities.
- Idempotent posting simulation, immutable simulated-posting reversal and replay protection.
- Lineage-linked calculation reruns that do not overwrite the source run.
- Price-document reconciliation with expected, actual and difference evidence.
- Persona action annotations, productive organizational-scope checks and read-only governed projections.
- Themed SAPUI5 control tower with explicit light text on dark surfaces.

Calculation Bucket/Run remains outside the confirmed user journey because approved outcomes hand off to existing debit/provision automation. The existing calculation service is retained for trial evidence and is hidden from the primary UI.

## Last verified baseline

Verified locally on 2026-10-31:

- Node.js `22.23.3`; npm `10.9.9`.
- SAP CAP runtime `10.1.1`; development kit resolved to `10.2.0` in the lockfile.
- `npm.cmd test`: **14/14 passed**.
- `npm.cmd run build`: passed; Node.js-only CAP build, no HANA deployer.
- `npm.cmd audit --omit=dev`: zero production vulnerabilities.
- SAPUI5 XML view parsing: passed.
- Health, UI and OData metadata endpoints: HTTP 200.
- Direct write to governed `VendorPartLinkages`: HTTP 405 as designed.
- Linkage/exception/later-allocation/BOM/composition workflow: passed.
- Advisory exclusion remained `EXCLUDED` through submission and approval.
- Price proposal reconciliation: expected INR 2,265, actual INR 2,265, difference zero.
- Calculation result: 300 receipt units less 20 reversal units = 280 eligible units; INR 4,200 impact.
- Posting reversal replay returned the existing reversal record.
- Lineage-linked rerun completed with the same INR 4,200 result.

The isolated verification process on port 4005 was stopped. Any older process still running on port 4004 must be restarted to load the latest source.

## What remains

### Immediate next step

Perform a human visual walkthrough of the new Master Data, Part RM Content, workflow-findings and reconciliation screens. Automated local Edge screenshot/DOM capture produced no inspectable output, although the application and API requests returned successfully. Record review feedback and any acceptance decisions in the project documents.

### Trial Gate T2 preparation

- Complete field-level reviews with Product Owner, Purchasing and Finance.
- Compare the accepted demo scenarios with approved, anonymized current-process examples.
- Confirm formulas, rounding, UoM/currency rules, workflows, reports and approval authority.
- Resolve or explicitly retain the open business questions in `PROJECT_GUIDELINES.md`.
- Agree the weighted product-definition scope and acceptance evidence.

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
| `test` | Fourteen automated domain, workflow, authorization and adapter tests. |
| `test/requests.http` | Read-only health, workbench, contract, BOM and evidence requests for manual smoke checks. |
| `docs/ACCEPTANCE_REVIEW_CHECKLIST.md` | Human UI/process review and Gate T1/T2 decision template. |
| `server.js` | CAP bootstrap, health endpoint and trial worker startup. |
| `manifest.yml`, `mta.yaml` | Trial Cloud Foundry descriptors; not yet deployed in this phase. |
| `xs-security.json` | Declared future productive scopes and role templates. |

## Working-tree summary

The committed handover baseline includes the UI theme/workbench, persona workflow models and actions, schema and seed extensions, security roles, pricing/commodity/workflow libraries, tests, dependency lockfile and documentation.

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

```text
Continue the Raw Material Content Management SAP CAP project from this workspace.

Before taking action, read these files completely in order:
1. AGENTS.md
2. PROJECT_GUIDELINES.md
3. docs/HANDOVER.md
4. docs/IMPLEMENTATION_STATUS.md
5. docs/ACCEPTANCE_REVIEW_CHECKLIST.md
6. docs/ARCHITECTURE.md
7. docs/PERSONAS_AND_FUNCTIONAL_SCOPE.md
8. docs/PRICING_WORKBENCH_DESIGN.md
9. README.md

The current handover baseline has been committed and pushed to `origin/main`. Pull the latest `main` branch first. Treat PROJECT_GUIDELINES.md as binding. Inspect `git status --short` before editing and preserve every existing change. Do not inspect artefacts/. Use synthetic data only. Do not introduce real S/4 connectivity, productive posting, HANA Cloud or new paid BTP services before the required approval gates.

First run `npm.cmd ci` if dependencies are absent, then `npm.cmd test` and `npm.cmd run build`. The expected baseline is 14/14 tests and a successful production CAP build. Report any mismatch before changing code.

The confirmed persona backlog and technical Trial Gate T1 rerun/reversal paths are complete; do not rebuild them. Start with the unfinished-task list at the end of docs/HANDOVER.md. The immediate objective is a human visual/functional review using docs/ACCEPTANCE_REVIEW_CHECKLIST.md, followed by recorded feedback and Trial Gate T1 closure evidence. Then prepare Trial Gate T2 scope convergence.

Do not invent unresolved accounting, S/4, Vistex, authorization or business decisions. Ask the user whenever a decision materially changes formulas, workflow, integration, security, cost or acceptance scope. BTP deployment must wait for an explicit user request, and real S/4 connectivity must wait for formal Gate T3 approval.
```

## Unfinished tasks

### Transfer prerequisite

1. Clone or pull the latest `origin/main` and confirm the working tree is clean before editing.
2. Verify `docs/HANDOVER.md` contains the 2026-10-31 snapshot.
3. Verify 14/14 tests, the production build and the zero-vulnerability production audit before continuing.

### Immediate product-review work

1. Restart the latest demo and perform the human visual/functional walkthrough in `docs/ACCEPTANCE_REVIEW_CHECKLIST.md`.
2. Review the new Master Data, Buyer linkage, contract exception/allocation, BOM hierarchy, leaf mapping, composition approval, findings and reconciliation screens.
3. Check desktop usability, horizontal table behavior, required-field clarity, dark-surface contrast, status readability and error messages.
4. Record every user observation as accept/change/defer/reject with an owner and acceptance criteria.
5. Correct any defects discovered during the review and rerun the complete automated and live smoke baseline.

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

### Known review limitation

Automated local Microsoft Edge screenshot/DOM capture returned no inspectable output. HTTP/UI endpoints and SAPUI5 XML parsing passed, but visual acceptance must be performed by a person or by an agent with functioning browser-automation tooling.
