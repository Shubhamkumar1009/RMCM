# Raw Material Content Management

Trial-first SAP CAP application for vendor commodity-price changes, part raw-material content, retrospective GR impact, approvals, posting simulation and purchasing-contract price proposals.

The binding project rules are in [PROJECT_GUIDELINES.md](PROJECT_GUIDELINES.md). The current architecture is described in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

For a complete project handover, document map, new-laptop setup, and a copy-ready Codex continuation prompt, see [docs/HANDOVER.md](docs/HANDOVER.md).

## What is implemented

- Synthetic suppliers, contracts, parts, BOMs, GRs, RM types/grades and vendor prices
- Part raw-material profiles and constituent traceability
- Vendor commodity price-change workflow
- Optimistic concurrency and approval audit records
- Asynchronous, priority-based retrospective calculation queue
- Exact decimal calculation with GR/reversal movement rules
- Configurable batch size, rounding, workflow and movement-type policies
- Calculation progress, exceptions and explanation
- Approval of completed calculations
- Idempotent MRNB-equivalent posting simulation
- Contract-price proposal generation
- SAPUI5 control-tower, worklists and administration UI
- Health endpoint and Cloud Foundry trial manifest

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
