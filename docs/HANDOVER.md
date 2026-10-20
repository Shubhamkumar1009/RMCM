# Project Handover

## Purpose

This document lets a developer or Codex session continue the Raw Material Content Management (RMC) project on another laptop without relying on prior chat history. Read this document first, then follow the binding rules in `PROJECT_GUIDELINES.md`.

## Current continuation point

The repository contains a working trial-first SAP CAP vertical slice. The synthetic end-to-end workflow is implemented: vendor raw-material price request, approval, queued retrospective calculation, review and approval, posting simulation, and contract-price proposal. The SAPUI5 application also exposes administration of calculation and workflow settings.

The latest verified baseline is 20 October 2026:

- Node.js 22.23.3 and npm 10.9.9
- SAP CAP runtime 10.1.1, CAP development kit 10.1.0, and SQLite adapter 3.1.2
- All 5 unit tests pass
- `npm run build` completes successfully
- The demo uses synthetic data, dummy authentication, in-memory SQLite, and a simulated posting adapter

The next phase is not productive SAP integration. First complete the remaining Trial Gate T1 feedback/exception journeys and Trial Gate T2 scope convergence: field-level reviews, approved formulas and rules, Vistex comparison, workflow and reporting decisions, and resolution of the open business questions in `docs/IMPLEMENTATION_STATUS.md`. Real S/4 connectivity and real business data are prohibited before formal Gate T3 approval.

## Non-negotiable boundaries

- Treat `PROJECT_GUIDELINES.md` as the binding source of truth.
- Keep the productive S/4 core clean and use released integration/extensibility mechanisms.
- Keep the CAP application stateless in the productive design.
- Never present the trial adapters as production-ready.
- Do not connect the current demo to productive S/4 or use confidential business data.
- Preserve exact decimal calculations, auditability, optimistic concurrency, idempotency, maker-checker controls, and explainability.
- Do not enable mock adapters or demo seed behavior in a productive profile.
- Do not use `npm audit fix --force`; it proposes an incompatible CAP downgrade for development-only advisories.

## Document map

| Document | Purpose |
|---|---|
| `README.md` | Quick introduction, local run commands, trial deployment command, and demo walkthrough. |
| `PROJECT_GUIDELINES.md` | Binding architecture, functional scope, controls, delivery gates, definition of done, assumptions, and governance. It overrides informal notes. |
| `docs/ARCHITECTURE.md` | Concise description of the implemented modular-monolith architecture, module responsibilities, scaling model, and production adapter boundary. |
| `docs/IMPLEMENTATION_STATUS.md` | Implemented capabilities, last verified results, work required before production, and business assumptions still awaiting confirmation. |
| `docs/HANDOVER.md` | Continuation context, repository map, new-laptop instructions, exclusions, and the Codex restart prompt. |
| `manifest.yml` | Direct Cloud Foundry trial deployment descriptor using a random route. |
| `mta.yaml` | MTA deployment descriptor for the same single-instance trial application. |
| `xs-security.json` | XSUAA roles and scopes intended for a future secured deployment. |

## Source map

| Path | Responsibility |
|---|---|
| `app/rmc/webapp` | Freestyle SAPUI5 user interface. |
| `db/schema.cds` | CAP domain model for the demo and canonical extension contract. |
| `db/data` | Version-controlled synthetic seed data. |
| `srv/rmc-service.*` | Business OData API, workflow actions, validations, concurrency, and audit records. |
| `srv/admin-service.*` | Controlled configuration API. |
| `srv/lib/calculation-engine.js` | Pure deterministic decimal calculation logic. |
| `srv/lib/calculation-worker.js` | Asynchronous queue claim and chunk processing for the trial. |
| `srv/lib/demo-posting-adapter.js` | Idempotent simulation only; it never posts to SAP. |
| `test` | Automated unit tests and example HTTP requests. |
| `scripts/reset-demo.js` | Explains how to reset the disposable demo data. |
| `server.js` | CAP server bootstrap, health endpoint, and worker startup. |

## Files deliberately excluded from GitHub

- `artefacts/` and everything under it, including the source PDF and DOCX reference material
- `node_modules/` installed dependencies
- `gen/`, `dist/`, and `coverage/` generated output
- SQLite database files, logs, local environment files, and local IDE settings

The excluded reference documents may contain material that should not be copied to a public repository. They are not required to build or run the application.

## Set up on another laptop

1. Install Git, VS Code, and Node.js 22 LTS (Node 24 is also accepted by `package.json`).
2. Install the Codex extension in VS Code and sign in.
3. Clone the repository and open its folder in VS Code.
4. In the VS Code terminal, run:

   ```powershell
   npm.cmd install
   npm.cmd test
   npm.cmd run build
   npm.cmd run start:demo
   ```

5. Open `http://localhost:4004/rmc/webapp/index.html`.

`npm.cmd` is used because some Windows PowerShell configurations block the `npm.ps1` wrapper. If `npm` works normally, either form is acceptable.

## Demo walkthrough

1. Open **Commodity Prices** and select `PCR-2026-0001`.
2. Submit and approve it. Self-approval exists only for the one-user demo.
3. Queue its retrospective calculation for the September validity period.
4. Open **Impact & Posting** and allow the worker to process two receipts and one reversal.
5. Approve the completed result and simulate posting.
6. Create a contract-price proposal.
7. Use **Administration** to review calculation, rounding, movement-type, price-rule, and approval settings.

Expected golden result: 300 receipt units minus 20 reversed units equals 280 eligible units; the impact is INR 4,200; the contract price changes from INR 2,250 to INR 2,265.

## Copy-ready Codex continuation prompt

```text
Continue development of this Raw Material Content Management (RMC) SAP CAP project from the checked-in baseline.

Before making changes, read these files completely in this order:
1. docs/HANDOVER.md
2. PROJECT_GUIDELINES.md
3. docs/IMPLEMENTATION_STATUS.md
4. docs/ARCHITECTURE.md
5. README.md

Treat PROJECT_GUIDELINES.md as binding. Preserve all trial/production safety boundaries: synthetic data only, no real S/4 connectivity before Gate T3, clean-core integration, exact decimal calculations, auditability, idempotency, optimistic concurrency, and maker-checker controls. Do not commit artefacts/, node_modules/, gen/, secrets, local databases, or environment files.

First inspect the repository and run `npm.cmd test` and `npm.cmd run build`. Report the current state and any mismatch with the handover. Then continue from the documented continuation point: close remaining Trial Gate T1 gaps and prepare Trial Gate T2 scope convergence. Do not invent unresolved business, accounting, S/4, or Vistex decisions; record them and ask me when a decision materially affects implementation.
```

After pasting the prompt, add the specific feature or issue you want Codex to handle next.
