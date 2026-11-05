# First Prompt for the Next AI Agent

Copy everything inside the block below and use it as the first message when continuing this project with another AI agent.

```text
Continue the Raw Material Content Management SAP CAP project from this workspace.

Before acting, read completely in this order: AGENTS.md, PROJECT_GUIDELINES.md, docs/HANDOVER.md, FIRST_PROMPT.md, docs/IMPLEMENTATION_STATUS.md, docs/ACCEPTANCE_REVIEW_CHECKLIST.md, docs/ARCHITECTURE.md, docs/PERSONAS_AND_FUNCTIONAL_SCOPE.md, docs/PRICING_WORKBENCH_DESIGN.md, docs/REFERENCE_SCOPE_AUDIT.md, docs/LEGACY_RMCM_PARITY_AUDIT.md, docs/DESIGN_REFERENCE_ADOPTION.md and README.md. PROJECT_GUIDELINES.md is binding. Run `git status --short` before editing and preserve every existing change.

The committed baseline is `origin/main` commit `f793d2b` (`Complete RMC persona workflows and trial handover`). A large intentional uncommitted increment follows that commit: business and architecture decks/generators; visual-review scripts/evidence; dashboard/reference enrichment; continuity documents; and the complete legacy RMCM audit/first parity implementation across schema, seed policy, CAP service, SAPUI5 UI and tests. Do not reset, checkout or rebuild these changes blindly.

The user explicitly authorized one completed review of `artefacts/Old RMCM Application`: three manuals, a screen-wise field workbook and two reported-issue artifacts were fully audited, including all 190 unique embedded manual images and all nine issue slides. The authoritative findings are in docs/LEGACY_RMCM_PARITY_AUDIT.md. That artefacts folder is out of scope again unless the user explicitly brings it back.

The new parity increment includes:
- governed Buyer creation of absolute or delta price requests with server-derived old price, overlap prevention, three amendment dates and retained source/repository references;
- sequential two-step price approval driven by active policies, mandatory remarks and immutable step/role/version evidence;
- VPL type, part type, indexing frequency, initial settled rate/currency, preliminary exposure and source reference;
- governed geometry, weight, scrap, surface-process and commercial composition attributes with server validation;
- unique source-document-line and calculation-line controls against duplicate exposure;
- a Controls & Audit tab with twelve honest legacy issue controls, approval history and execution correlation references;
- test/legacy-parity-contract.test.js and an updated authorization contract.

The UI now has a top-right trial-only `View as` selector for Buyer, RM Admin, Commodity Admin, Approver and All personas. It filters tabs, maker/decision forms and actions and returns to the persona’s default workspace. It is presentation state only: do not treat it as authentication or authorization. CAP annotations remain the trial service contract and productive IAS/XSUAA plus organizational attributes remain gated.

The user-supplied `artefacts/RMCM Design POC/RMCM.html` was reviewed only for visual and non-AI interaction patterns. The application adopted a compact graphite shell, product mark, collapsible persona-aware left navigation, selected-state rail, workspace context, neutral canvas and denser operational surfaces. Do not copy the HTML's sample data or introduce its AI suggestions, HANA Cloud assumption, market feeds, vendor portal or automatic posting claims. The exact boundary is in docs/DESIGN_REFERENCE_ADOPTION.md; do not inspect the artefact again unless the user explicitly requests it.

The latest UI increment corrects the upper-left menu/product-mark collision, makes the `RM` initials fully legible, and aligns Current/Proposed contribution bars on fixed label/value columns. It also adds a persona-visible Analytics Dashboard with four KPIs, 12-month price/index movement, workflow mix, six-supplier exposure, six-commodity comparison and eight-month impact history. These expanded analytical series are explicitly synthetic UX-review data; server-owned workbench values remain authoritative.

The UI was subsequently revamped as a professional enterprise control tower. It now uses SAPUI5's native 3rem header geometry, simplified brand/persona chrome, compact executive Overview KPIs, a restrained navy/blue hierarchy, consistent typography, low-elevation white surfaces and standardized cards/forms/tables across all eight navigation areas. Preserve this system and do not reintroduce large generic tiles, excessive purple gradients or an oversized toolbar that overlaps the navigation rail.

Contrast and responsive behavior use explicit light foregrounds on dark gradients, container-bounded flexible layouts, wrapped action groups and internal table overflow. The last verified baseline is 20/20 tests, successful production CAP build, successful UI XML/JavaScript parsing and zero production dependency vulnerabilities. Live smoke verified a DELTA request from INR 220 to INR 225.50, three amendment dates, a system event and SUBMITTED → UNDER_REVIEW → APPROVED decisions by RmcEditor, RmcApprover and RmcFinance. Playwright/Edge captured 26 states at 1440×900 and 1366×768, including three analytics views and collapsed navigation, with no page errors, dark-surface findings, global overflow or measured table overflow. The expected development-only Component-preload.js miss remains harmless.

Do not claim complete legacy parity. Remaining work is:
1. Preview-first bulk imports with exact row/column/field diagnostics.
2. Background report/export jobs and a centralized download repository.
3. Threshold/DOA routing, named approvers, delegation, skip rules, ageing and secure reminders.
4. Governed scrap, surface, operation-cost and non-RM cost masters.
5. Signed Finance rules for Plus-1, MASOP, offcut, scrap, surface protection, RT/APV and independent dates.
6. Explicit VPL preview/diff and a donor colour-part decision.
7. Decide which legacy reports remain separate outputs versus consolidated workbench exports.
8. Productive IAS/XSUAA and released S/4 adapters only after approved gates.
9. Clarify what the legacy “PAN number” means.

Ask business/Finance to decide whether the legacy formulas are authoritative or redesign candidates, what “PAN number” means, and which reports must remain separately named. Do not activate disputed financial formulas without signed rules.

Use synthetic data only. Do not deploy to BTP until the user explicitly requests it. Do not connect to S/4, use real data, introduce HANA Cloud/paid services or perform real posting before the required gates. Do not use `npm audit fix --force`.

After every substantive interaction, update AGENTS.md, docs/HANDOVER.md and FIRST_PROMPT.md without waiting to be reminded. Keep completed work, validation, uncommitted changes, remaining tasks and the exact continuation point synchronized.
```

## Current continuation point

Run the human persona, professional-shell, analytics-dashboard and legacy-parity review using the top-right selector, collapsible left navigation and `docs/ACCEPTANCE_REVIEW_CHECKLIST.md`. Confirm the enterprise visual hierarchy and synthetic analytics terminology, resolve the three business/Finance decisions above, then implement the accepted parity backlog in risk order. Architecture sign-off, productive authentication and BTP deployment remain separate explicit decisions.
