# Modern UI and UX Reference Adoption

## Scope and guardrails

On 2026-11-01, `artefacts/RMCM Design POC/RMCM.html` was reviewed only as a design and interaction reference at the user's explicit request.

- No sample supplier, price, contract, quantity, KPI, employee or company data was copied.
- No AI suggestion, external market-feed, vendor-portal, HANA Cloud or automatic productive-posting claim was adopted.
- Existing governed CAP services, exact-decimal calculations, persona rules and project gates remain authoritative.
- The source HTML remains read-only reference material and is excluded again unless the user explicitly brings it back into scope.

## Adopted design language

| Reference pattern | Application adoption |
|---|---|
| Compact graphite application shell | Dark, space-efficient shell with product mark, title, persona context and permanent demo warning |
| Persistent left navigation | Persona-aware SAPUI5 side navigation with selected-state rail and fixed governance/admin items |
| Collapsible navigation | Shell menu button expands or collapses the side navigation without losing the selected workspace |
| Role context in shell | Existing trial persona selector retained and visually integrated; workspace header explains the selected persona |
| Page title and context region | New workspace header shows persona, responsibility summary, synthetic-data state and role-visualization warning |
| Analytics information density | A separate dashboard uses compact KPI cards, comparison panels and visual hierarchy inspired by the reference; all series were newly created as labelled synthetic demo data and no reference values were copied |
| Enterprise visual refinement | The final revamp uses the reference only as directional inspiration, then applies an original restrained navy/blue system, native SAPUI5 shell geometry, compact executive KPIs and standardized operational surfaces |
| White work surfaces on neutral canvas | Fiori-like neutral background, white cards/panels, restrained borders and lower-noise shadows |
| Compact information hierarchy | Reduced corner radii, denser section headers, blue selection rail and consistent card top accents |
| Responsive filter/form behavior | Container-bounded flex layouts, wrapped action groups and internal table scrolling |
| Status-first workflow presentation | Existing state badges, decision rails and seven-stage workflow retained and restyled |

## Non-AI interaction features retained or strengthened

- Persona-specific navigation, maker forms and approval actions.
- Collapsible navigation for more working width.
- Sticky selected navigation and clear workspace context.
- Compact action toolbars, expandable sections and sticky table headers already provided by SAPUI5.
- Search, contract lookup, workflow history, exception resolution and reconciliation remain real application functions rather than mock interactions.
- Responsive evidence now covers the full route and persona workspaces at the two target laptop resolutions.

## Patterns intentionally not adopted

- AI price suggestions, recommendations or generative assistants.
- Live LME/MCX/forex values or unapproved external feeds.
- Reference sample data, KPIs, identities, company branding or document numbers.
- HANA Cloud as a dependency; it conflicts with the binding baseline.
- Vendor portal scope, automatic SAP posting or new modules not confirmed in `PROJECT_GUIDELINES.md`.
- Decorative search, notifications, export or pagination controls without working backend behavior.

## Verification expectation

The adopted design must continue to pass XML/JavaScript parsing, automated tests, production build, production dependency audit and browser review at 1440×900 and 1366×768. Dark surfaces must use light foregrounds, and page-level horizontal overflow is not acceptable.
