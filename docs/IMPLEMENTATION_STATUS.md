# Implementation Status

## Implemented trial vertical slice

- Standard CAP `app`, `db`, `srv`, `test` and deployment structure
- Synthetic S/4-like reference data and resettable in-memory demo storage
- RM type/grade, BOM, part profile, constituent, vendor-price and contract model
- Vendor commodity-price request submission and approval
- Configured approval-role enforcement with demo-only self-approval
- Priority calculation queue with atomic claim, chunking, progress and exception capture
- Effective-dated supplier/part profile selection
- Configurable GR movement eligibility and reversal signs
- Exact decimal retrospective-impact calculation
- Calculation approval with unresolved-exception protection
- Idempotent posting simulation
- Contract-price proposal generation
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

## Required before production

- Replace dummy authentication with IAS/XSUAA role collections
- Replace in-memory SQLite with approved clean-core S/4 extension services
- Implement released S/4 reference-data adapters
- Prove BOM explosion behavior against the real S/4 system
- Implement a shared durable job queue with leases and stale-worker recovery
- Apply organizational and amount ranges across multi-step approval policies
- Implement exception resolution/exclusion workflow
- Implement supported MRNB-equivalent posting and status/reversal inquiry
- Implement S/4 purchasing-contract update and Flexible Workflow status
- Add currency/UoM conversion services and signed Finance rules
- Add data migration, reconciliation, observability, security and load testing

## Current assumptions needing confirmation

1. Trial data may be entirely synthetic and reset whenever the application restarts.
2. One demo identity may submit and approve; this is disabled for production.
3. Price is expressed per one price unit unless configured otherwise.
4. Demo composition quantities are already normalized; yield and scrap are multiplicative factors.
5. Movement 101 adds quantity, while 102 and 122 subtract quantity.
6. Contract-price delta is calculated as approved run amount divided by eligible part quantity.
7. A price-change calculation period must remain inside its approved validity interval.
