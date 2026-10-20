# Architecture

## Current implementation boundary

The trial application is a cost-minimized CAP modular monolith. It contains a SAPUI5 application, OData V4 services, domain logic, an asynchronous calculation worker, and disposable in-memory SQLite demo persistence in one Cloud Foundry application.

SQLite and the in-process worker are trial adapters. They are not approved for productive scale-out. CAP 10 currently reports its SQLite implementation as experimental; that is acceptable only for this disposable trial profile.

## Modules

| Module | Responsibility |
|---|---|
| `app/rmc` | Freestyle SAPUI5 worklists, approvals, calculation monitoring and administration |
| `db/schema.cds` | Canonical demo model and future S/4 extension contract |
| `srv/rmc-service.*` | Business APIs, workflow invariants, optimistic concurrency and audit records |
| `srv/admin-service.*` | Controlled configuration maintenance |
| `srv/lib/calculation-engine.js` | Pure deterministic decimal calculation logic |
| `srv/lib/calculation-worker.js` | Queued, claimed and chunked month-end processing |
| `srv/lib/demo-posting-adapter.js` | Idempotent posting simulation; never calls SAP |
| `db/data` | Synthetic and resettable demo dataset |

## Scale design

The productive implementation will retain stateless CAP instances while replacing SQLite with clean-core S/4 services and customer-owned S/4 extension persistence. A shared durable queue must support atomic claims, leases, heartbeats, retries and stale-lease recovery before CAP is scaled beyond one worker instance.

Month-end load is controlled by:

- Queue priority rather than synchronous bulk calculation
- Configurable batch size
- Atomic `QUEUED` to `RUNNING` claim
- Calculation snapshots
- Set-based inserts
- Progress heartbeats
- Idempotent posting keys
- Optimistic versions on approval actions

The current worker deliberately processes one run at a time in the trial. `WORKER_MAX_CONCURRENT_RUNS` is retained as a production design setting but is not activated against SQLite.

The S/4 extension persistence design must provide indexed access paths equivalent to:

- Calculation run by status, priority and creation time
- Goods receipt by supplier, posting date and stable cursor key
- Part profile by supplier, material, status and validity
- Constituent by profile, grade and version
- Price change by supplier, grade, validity and status
- Posting record by unique idempotency key
- Approval and system event by object and timestamp

These are logical index requirements; their ABAP/S/4 implementation must follow the approved extensibility model rather than copying the SQLite schema.

## Production adapter contract

The application must implement the ports defined in the project guideline:

- S/4 reference data
- RMC repository
- posting/revaluation
- contract update
- identity and authorization

No productive deployment is permitted while demo persistence or the simulated posting adapter is active.
