# Trial Acceptance Review Checklist

Use this checklist for the first human review after the 2026-10-31 handover. Record evidence and decisions; do not treat an unchecked item as implicitly accepted.

Agent pre-review evidence and the three corrected visual defects are documented in [`VISUAL_REVIEW_REPORT.md`](VISUAL_REVIEW_REPORT.md). The checkboxes below remain for human/persona acceptance.

The reference source has also been re-audited under the strict pages 1-38 boundary documented in [`REFERENCE_SCOPE_AUDIT.md`](REFERENCE_SCOPE_AUDIT.md); pages 39-58 are outside scope and must not influence acceptance.

## 1. Review preparation

- [ ] Confirm only synthetic data is visible.
- [ ] Restart the demo with `npm.cmd run start:demo` so seed state is restored.
- [ ] Confirm `npm.cmd test` reports 20/20 passing tests.
- [ ] Confirm `npm.cmd run build` succeeds.
- [ ] Open `http://localhost:4004/rmc/webapp/index.html` and confirm the persistent **DEMO — NOT CONNECTED TO S/4HANA** indicator.

## 2. Visual and usability review

- [ ] Master Data pulse cards communicate governed catalog coverage clearly.
- [ ] Commodity Price governance cards make request volume, approval state, selected movement and document state understandable.
- [ ] Pricing Workbench decision rail clearly communicates source integrity, data quality, release path and decision exposure.

- [ ] Dark headers, heroes, metric cards and emphasized buttons use readable light text.
- [ ] Overview and Master Data screens are readable at normal laptop width.
- [ ] Overview price bridge, impact equation, readiness bars, RM contribution comparison and seven-stage journey agree with the selected workbench scenario.
- [ ] Upper-left menu, `RM` product mark and side-navigation corner have clear separation with no overlap; the white initials remain legible.
- [ ] Current and Proposed contribution bars share identical label, track and value columns at laptop width.
- [ ] Analytics Dashboard trend, supplier, commodity, workflow and impact visuals are readable and clearly understood as synthetic UX-review data rather than governed financial results.
- [ ] Confirm the compact KPI cards, native-height shell, restrained navy/blue hierarchy and consistent operational surfaces feel suitable for an enterprise business application.
- [ ] Confirm no navigation rail, product mark or menu control overlaps at either 1440×900 or 1366×768.
- [ ] Dashboard animation is subtle, does not delay interaction and is disabled when the operating system requests reduced motion.
- [ ] Buyer linkage and composition forms do not hide required fields or actions.
- [ ] Tables remain understandable when horizontally scrolled.
- [ ] Status colors are accompanied by text and are not the only status signal.
- [ ] Validation and error messages identify the corrective action.
- [ ] Terminology matches business language for Commodity Admin, RM Admin, Buyer and Approver.

## 3. Persona journeys

### Persona selector

- [ ] Select Buyer and confirm maker forms/actions are present while approval actions are absent.
- [ ] Select RM Admin and confirm RM-master Approve/Reject is present while Buyer and commodity-maintenance forms are absent.
- [ ] Select Commodity Admin and confirm commodity create/validity/deletion controls are present while RM approval controls are absent.
- [ ] Select Approver and confirm exception, composition and price decisions are present while Buyer entry forms are absent.
- [ ] Select All personas (demo) and confirm the complete walkthrough workspace returns.
- [ ] Confirm reviewers understand this selector visualizes personas but does not provide authentication or authorization.
- [ ] Collapse and expand the left navigation; confirm the active workspace and persona selection are retained.
- [ ] Confirm the graphite shell, neutral canvas, workspace header and compact cards improve navigation without hiding business context.

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

- [ ] Create one absolute-rate and one delta-mode governed price request; confirm the server derives the effective old price and rejects overlapping active requests.
- [ ] Confirm all three amendment dates and source/repository references are retained.
- [ ] Complete level-one and level-two approval with mandatory remarks; verify step, role, version and decision evidence in Controls & Audit.
- [ ] Submit and approve the synthetic revised RM price.
- [ ] Review impacted parts, cost sheet and calculation trace.
- [ ] Release simulation-only mode without approval.
- [ ] Release amendment mode and complete Approver decision.
- [ ] Confirm approved handoff shows INR 2,250 current price and INR 2,265 proposed price.
- [ ] Reconcile expected and actual price; difference should be zero.

### Legacy parity and issue controls

- [ ] Review VPL type, part type, indexing frequency, initial settled rate, preliminary exposure and source reference with Purchasing.
- [ ] Review geometry, weight, scrap, surface-process and commercial-cost fields with Engineering/Purchasing; confirm which are mandatory by part type.
- [ ] Confirm duplicate source-document and repeated calculation-line scenarios are rejected.
- [ ] Review all twelve live issue-control rows; accept the implemented/partial/gated classifications or record corrections.
- [ ] Finance decides whether legacy MASOP, Plus-1, offcut, scrap, surface-protection, RT and APV formulas are authoritative or only candidates for redesign.
- [ ] Business clarifies the legacy “PAN number” field and decides which named legacy reports must remain separate outputs.

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
