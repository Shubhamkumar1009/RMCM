# Trial Acceptance Review Checklist

Use this checklist for the first human review after the 2026-10-31 handover. Record evidence and decisions; do not treat an unchecked item as implicitly accepted.

## 1. Review preparation

- [ ] Confirm only synthetic data is visible.
- [ ] Restart the demo with `npm.cmd run start:demo` so seed state is restored.
- [ ] Confirm `npm.cmd test` reports 14/14 passing tests.
- [ ] Confirm `npm.cmd run build` succeeds.
- [ ] Open `http://localhost:4004/rmc/webapp/index.html` and confirm the persistent **DEMO — NOT CONNECTED TO S/4HANA** indicator.

## 2. Visual and usability review

- [ ] Dark headers, heroes, metric cards and emphasized buttons use readable light text.
- [ ] Overview and Master Data screens are readable at normal laptop width.
- [ ] Buyer linkage and composition forms do not hide required fields or actions.
- [ ] Tables remain understandable when horizontally scrolled.
- [ ] Status colors are accompanied by text and are not the only status signal.
- [ ] Validation and error messages identify the corrective action.
- [ ] Terminology matches business language for Commodity Admin, RM Admin, Buyer and Approver.

## 3. Persona journeys

### Commodity Admin

- [ ] Create an acceptable commodity.
- [ ] Close its validity without extending the previous valid-to date.
- [ ] Apply and clear the deletion marker; confirm the record is never physically deleted.

### Buyer and RM Admin

- [ ] Buyer creates and submits an RM master request.
- [ ] RM Admin approves it and the activated code becomes selectable.
- [ ] Stale-version and invalid-parent cases are rejected.

### Buyer linkage and contract exception

- [ ] Search valid contracts by supplier, material, plant and business date.
- [ ] Create an allocated linkage when a valid contract exists.
- [ ] Create a missing-contract linkage with a reason.
- [ ] Approver approves or rejects the exception.
- [ ] Buyer allocates a valid contract later without losing the exception history.

### BOM and composition

- [ ] Display the supported BOM hierarchy with depth, lineage and leaf indicators.
- [ ] Confirm RM mapping is accepted only on leaf items.
- [ ] Create a composition revision and map grade/subgrade and weights.
- [ ] Confirm mandatory incomplete mappings block submission/approval.
- [ ] Exclude a documented advisory finding and confirm it remains excluded.
- [ ] Submit and approve the complete revision; confirm approved content is immutable.

### Pricing and handoff

- [ ] Submit and approve the synthetic revised RM price.
- [ ] Review impacted parts, cost sheet and calculation trace.
- [ ] Release simulation-only mode without approval.
- [ ] Release amendment mode and complete Approver decision.
- [ ] Confirm approved handoff shows INR 2,250 current price and INR 2,265 proposed price.
- [ ] Reconcile expected and actual price; difference should be zero.

## 4. Trial Gate T1 evidence

- [ ] Confirm 300 receipt units less 20 reversal units equals 280 eligible units.
- [ ] Confirm retrospective impact is INR 4,200.
- [ ] Confirm posting is clearly simulated and no S/4 call occurs.
- [ ] Reverse the simulated posting and verify replay returns the same reversal record.
- [ ] Rerun the calculation and verify lineage to the source run and the same INR 4,200 result.
- [ ] Demonstrate rejection and corrective rework paths.

## 5. Decisions to record

For every issue or requested change, record:

| Field | Entry |
|---|---|
| Review date | |
| Reviewer/persona | |
| Screen/process | |
| Observation | |
| Decision | Accept / change / defer / reject |
| Owner | |
| Acceptance criteria | |
| Data/authorization/integration impact | |
| Target gate or release | |

## 6. Exit decision

- [ ] Product Owner accepts the demonstrated scope or records all gaps.
- [ ] Purchasing accepts the Buyer and Approver journeys.
- [ ] Finance accepts formulas, evidence and reconciliation behavior.
- [ ] Unresolved accounting, S/4, Vistex and security questions remain explicitly open rather than assumed.
- [ ] The team agrees whether Trial Gate T1 can close and what enters Trial Gate T2.
