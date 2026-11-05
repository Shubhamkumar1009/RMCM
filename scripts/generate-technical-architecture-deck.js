/* eslint-disable no-console */
'use strict';

const path = require('path');
const pptxgen = require('pptxgenjs');
const { icon } = require('@fortawesome/fontawesome-svg-core');
const fa = require('@fortawesome/free-solid-svg-icons');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Raw Material Content Management Project';
pptx.company = 'RMC';
pptx.subject = 'Leadership architecture sign-off for the RMC application on SAP BTP and SAP S/4HANA';
pptx.title = 'RMC Technical Architecture — Leadership Sign-off';
pptx.lang = 'en-IN';
pptx.theme = { headFontFace: 'Aptos Display', bodyFontFace: 'Aptos', lang: 'en-IN' };

const C = {
  navy: '0B1F3A', navy2: '13294B', ink: '172033', slate: '334155', muted: '64748B',
  blue: '2563EB', blue2: '0EA5E9', purple: '6D28D9', violet: '8B5CF6', indigo: '4338CA', cyan: '06B6D4',
  green: '059669', amber: 'D97706', red: 'DC2626', white: 'FFFFFF', bg: 'F7F8FC',
  border: 'DDE3F0', pale: 'EEF2FF', paleBlue: 'EAF2FF', palePurple: 'F1EAFE',
  greenPale: 'DDF7EC', amberPale: 'FFF3D6', redPale: 'FEE2E2', grey: 'E2E8F0'
};

const OUT = process.env.RMC_ARCH_DECK_OUT
  ? path.resolve(process.env.RMC_ARCH_DECK_OUT)
  : path.resolve(__dirname, '..', 'docs', 'RMC_Technical_Architecture_Leadership_Signoff.pptx');

pptx.defineSlideMaster({
  title: 'ARCH_MASTER',
  background: { color: C.bg },
  objects: [
    { rect: { x: 0, y: 0, w: 0.14, h: 7.5, fill: { color: C.purple }, line: { color: C.purple } } },
    { rect: { x: 0.14, y: 0, w: 4.4, h: 0.055, fill: { color: C.blue }, line: { color: C.blue } } },
    { rect: { x: 4.54, y: 0, w: 4.4, h: 0.055, fill: { color: C.purple }, line: { color: C.purple } } },
    { rect: { x: 8.94, y: 0, w: 4.39, h: 0.055, fill: { color: C.cyan }, line: { color: C.cyan } } },
    { line: { x: 0.46, y: 7.09, w: 12.32, h: 0, line: { color: C.border, width: 1 } } },
    { text: { text: 'RMC TECHNICAL ARCHITECTURE', options: { x: 0.54, y: 7.16, w: 4.1, h: 0.16, fontFace: 'Aptos', fontSize: 6.8, bold: true, color: C.muted, charSpacing: 1.25, margin: 0 } } },
    { text: { text: 'PROPOSED TARGET — LEADERSHIP SIGN-OFF', options: { x: 8.0, y: 7.16, w: 4.75, h: 0.16, fontFace: 'Aptos', fontSize: 6.8, bold: true, color: C.purple, align: 'right', margin: 0 } } }
  ],
  slideNumber: { x: 12.88, y: 7.14, w: 0.22, h: 0.18, fontFace: 'Aptos', fontSize: 7, color: C.muted, align: 'right', margin: 0 }
});

function svgData(name, color = C.white) {
  const def = fa[name] || fa.faCircle;
  const svg = icon(def).html.join('').replace(/currentColor/g, `#${color}`).replace(/style="[^"]*"/g, '');
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function addIcon(slide, name, x, y, w, color = C.white) {
  slide.addImage({ data: svgData(name, color), x, y, w, h: w });
}

function text(slide, value, x, y, w, h, o = {}) {
  slide.addText(value, {
    x, y, w, h, fontFace: o.fontFace || 'Aptos', fontSize: o.fontSize || 11,
    color: o.color || C.ink, bold: o.bold || false, margin: o.margin ?? 0,
    valign: o.valign || 'mid', align: o.align || 'left', fit: 'shrink',
    breakLine: false, paraSpaceAfterPt: 0, isTextBox: true, ...o
  });
}

function round(slide, x, y, w, h, fill = C.white, line = C.border, radius = 0.12) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: radius, fill: { color: fill }, line: { color: line, width: 1 }
  });
}

function pill(slide, value, x, y, w, fill, color = C.white) {
  round(slide, x, y, w, 0.3, fill, fill, 0.15);
  text(slide, value, x + 0.06, y + 0.02, w - 0.12, 0.24, { fontSize: 7.7, bold: true, color, align: 'center' });
}

function badge(slide, name, x, y, fill = C.purple, size = 0.48) {
  slide.addShape(pptx.ShapeType.ellipse, { x, y, w: size, h: size, fill: { color: fill }, line: { color: fill } });
  addIcon(slide, name, x + size * 0.25, y + size * 0.25, size * 0.5, C.white);
}

function title(slide, heading, subtitle, section = 'ARCHITECTURE') {
  text(slide, section, 0.58, 0.3, 3.2, 0.2, { fontSize: 7.8, bold: true, color: C.purple, charSpacing: 1.5 });
  text(slide, heading, 0.58, 0.57, 12.0, 0.5, { fontSize: 25, bold: true, color: C.navy });
  if (subtitle) text(slide, subtitle, 0.58, 1.09, 12.0, 0.34, { fontSize: 10.8, color: C.muted });
}

function note(slide, value) {
  if (slide.addNotes) slide.addNotes(value);
}

function service(slide, x, y, w, h, name, detail, iconName, accent = C.blue, tag) {
  round(slide, x, y, w, h, C.white, C.border);
  slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.06, h, fill: { color: accent }, line: { color: accent } });
  badge(slide, iconName, x + 0.2, y + 0.2, accent, 0.44);
  text(slide, name, x + 0.76, y + 0.18, w - 0.96, 0.3, { fontSize: 11.3, bold: true, color: C.navy });
  if (detail && h > 0.81) text(slide, detail, x + 0.22, y + 0.67, w - 0.44, h - 0.81, { fontSize: 8.7, color: C.slate, valign: 'top' });
  if (tag) pill(slide, tag[0], x + w - tag[1] - 0.16, y + 0.18, tag[1], tag[2], tag[3] || C.white);
}

function zone(slide, x, y, w, h, label, fill, line, iconName) {
  round(slide, x, y, w, h, fill, line);
  pill(slide, label, x + 0.18, y + 0.14, Math.min(2.7, Math.max(1.35, label.length * 0.085)), line, C.white);
  if (iconName) addIcon(slide, iconName, x + w - 0.48, y + 0.15, 0.24, line);
}

function arrow(slide, x1, y1, x2, y2, color = 'A5B4FC', label) {
  const x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
  slide.addShape(pptx.ShapeType.line, {
    x, y, w: Math.max(w, 0.001), h: Math.max(h, 0.001), flipV: (x2 - x1) * (y2 - y1) < 0,
    line: { color, width: 1.5, beginArrowType: 'none', endArrowType: 'triangle' }
  });
  if (label) {
    const lx = (x1 + x2) / 2 - 0.55, ly = (y1 + y2) / 2 - 0.16;
    pill(slide, label, lx, ly, 1.1, C.white, C.slate);
  }
}

function callout(slide, value, x, y, w, iconName = 'faCircleInfo', type = 'purple') {
  const map = { purple: [C.palePurple, C.purple], blue: [C.paleBlue, C.blue], amber: [C.amberPale, C.amber], red: [C.redPale, C.red], green: [C.greenPale, C.green] };
  const [fill, accent] = map[type];
  round(slide, x, y, w, 0.5, fill, fill);
  badge(slide, iconName, x + 0.12, y + 0.1, accent, 0.3);
  text(slide, value, x + 0.52, y + 0.08, w - 0.65, 0.34, { fontSize: 8.7, bold: true, color: accent });
}

function bulletRows(slide, rows, x, y, w, rowH = 0.56, accent = C.purple) {
  rows.forEach((row, i) => {
    badge(slide, row[0] || 'faCheck', x, y + i * rowH + 0.06, row[2] || accent, 0.3);
    text(slide, row[1], x + 0.43, y + i * rowH, w - 0.43, rowH - 0.04, { fontSize: 9.3, color: C.slate, valign: 'top' });
  });
}

// 1 — Cover
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.ellipse, { x: 8.4, y: -1.65, w: 6.8, h: 6.8, fill: { color: C.purple, transparency: 13 }, line: { color: C.purple, transparency: 100 } });
  s.addShape(pptx.ShapeType.ellipse, { x: 9.8, y: 3.45, w: 5.1, h: 5.1, fill: { color: C.blue, transparency: 18 }, line: { color: C.blue, transparency: 100 } });
  pill(s, 'LEADERSHIP ARCHITECTURE SIGN-OFF', 0.72, 0.66, 2.72, C.violet);
  text(s, 'Raw Material Content Management', 0.72, 1.52, 7.4, 0.8, { fontSize: 34, bold: true, color: C.white });
  text(s, 'Technical Architecture', 0.72, 2.34, 6.8, 0.62, { fontSize: 29, bold: true, color: 'BFD0F5' });
  text(s, 'A clean-core, cost-governed SAP BTP and SAP S/4HANA target architecture for controlled scale, auditability and future integration.', 0.75, 3.22, 6.95, 1.08, { fontSize: 15, color: 'D7E3FF', valign: 'top' });
  pill(s, 'PROPOSED TARGET', 0.76, 5.0, 1.55, C.blue);
  pill(s, 'NO HANA CLOUD BASELINE', 2.48, 5.0, 2.05, C.purple);
  pill(s, 'GATE-CONTROLLED', 4.7, 5.0, 1.62, C.indigo);
  zone(s, 8.42, 1.18, 3.9, 4.65, 'TARGET LANDSCAPE', '101A33', '5B6C91', 'faCloud');
  service(s, 8.82, 1.87, 3.1, 0.93, 'SAP BTP', 'SAPUI5 + app router + stateless CAP', 'faCloud', C.blue);
  service(s, 8.82, 3.02, 3.1, 0.93, 'Secure integration', 'XSUAA/equivalent + Destination', 'faShieldHalved', C.purple);
  service(s, 8.82, 4.17, 3.1, 0.93, 'SAP S/4HANA', 'Released APIs + clean-core extension', 'faBuildingColumns', C.indigo);
  text(s, 'Prepared 31 October 2026 • Synthetic trial remains isolated', 0.76, 6.66, 7.6, 0.28, { fontSize: 9, color: 'A5B4FC' });
  note(s, 'Opening message: this deck requests approval of architecture direction and guardrails. It does not authorize productive connectivity, business data, posting, or additional BTP services.');
}

// 2 — Sign-off ask
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'The leadership decision requested', 'Approve the target direction and guardrails; retain explicit gates for unresolved facts and service adoption.', 'EXECUTIVE DECISION');
  const asks = [
    ['faCircleCheck', 'Endorse', 'SAPUI5 + stateless CAP on Cloud Foundry, with S/4 as the authoritative system of record.', C.green],
    ['faShieldHalved', 'Protect', 'Clean core, segregation of duties, immutable evidence, idempotency and reconciliation as mandatory controls.', C.purple],
    ['faCoins', 'Constrain', 'Use only the minimum BTP allow-list; any additional paid service requires a costed ADR.', C.blue],
    ['faRoadBarrier', 'Gate', 'No real S/4 connectivity or real data before Transition Gate T3 and feasibility proof at Productive Gate P1.', C.amber]
  ];
  asks.forEach((a, i) => service(s, 0.62 + (i % 2) * 6.1, 1.7 + Math.floor(i / 2) * 1.65, 5.82, 1.38, a[1], a[2], a[0], a[3]));
  callout(s, 'Approval of this deck is architecture direction only — not a deployment, spend, interface-release or production-readiness approval.', 0.62, 5.26, 11.92, 'faTriangleExclamation', 'amber');
  callout(s, 'Recommended decision: CONDITIONAL APPROVAL subject to the open decisions and gates shown in this deck.', 0.62, 5.93, 11.92, 'faStamp', 'green');
  note(s, 'Ask leaders to agree on the direction, service constraints and decision governance. Open business and S/4 facts remain conditions, not assumptions.');
}

// 3 — Business outcomes mapped to architecture
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Architecture follows the business control journey', 'The platform exists to connect governed content, explainable pricing, controlled posting and reconciliation.', 'BUSINESS ALIGNMENT');
  const items = [
    ['faLink', 'Link', 'Supplier • part • plant • contract'],
    ['faSitemap', 'Model', 'BOM • leaf mapping • composition'],
    ['faTags', 'Price', 'Versioned RM prices and rules'],
    ['faCalculator', 'Calculate', 'GR eligibility and exact decimal impact'],
    ['faUserCheck', 'Approve', 'Maker-checker and organizational scope'],
    ['faPaperPlane', 'Execute', 'Supported S/4 outcome with idempotency'],
    ['faScaleBalanced', 'Reconcile', 'Expected • actual • reversed • outstanding']
  ];
  items.forEach((it, i) => {
    const x = 0.54 + i * 1.8;
    round(s, x, 2.0, 1.56, 2.45, C.white, C.border);
    badge(s, it[0], x + 0.5, 2.28, [C.blue, C.indigo, C.purple, C.violet, C.cyan, C.blue, C.green][i], 0.56);
    text(s, String(i + 1).padStart(2, '0'), x + 0.16, 2.22, 0.28, 0.2, { fontSize: 7.5, bold: true, color: C.muted });
    text(s, it[1], x + 0.14, 3.02, 1.28, 0.32, { fontSize: 12, bold: true, color: C.navy, align: 'center' });
    text(s, it[2], x + 0.16, 3.5, 1.24, 0.65, { fontSize: 8.2, color: C.slate, valign: 'top', align: 'center' });
    if (i < items.length - 1) arrow(s, x + 1.56, 3.18, x + 1.78, 3.18, 'A5B4FC');
  });
  callout(s, 'Architectural implication: CAP orchestrates the journey; S/4 remains authoritative for enterprise data, persisted RMC records and final documents.', 0.74, 5.1, 11.55, 'faBullseye', 'purple');
  note(s, 'Use this slide to connect platform choices to business outcomes; avoid discussing services as isolated technical components.');
}

// 4 — Principles
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Six principles that cannot be traded away', 'These are binding architecture controls from PROJECT_GUIDELINES.md.', 'GUARDRAILS');
  const principles = [
    ['faCubesStacked', 'Clean core', 'Released APIs/CDS/events or approved ABAP Cloud services; never direct S/4 table access.', C.blue],
    ['faDatabase', 'No CAP production database', 'S/4 owns durable RMC records; SQLite remains disposable trial/test only.', C.red],
    ['faCloud', 'Stateless CAP', 'Instances may restart or scale without losing business state.', C.purple],
    ['faFileShield', 'Financial evidence', 'Immutable snapshots, deterministic decimals, approvals, idempotency and reconciliation.', C.indigo],
    ['faCoins', 'Minimum recurring BTP cost', 'Adopt only allow-listed services; extras need a costed ADR and exit plan.', C.green],
    ['faCodeBranch', 'Ports and adapters', 'Demo and productive adapters change; domain rules, UI contracts and tests remain stable.', C.cyan]
  ];
  principles.forEach((p, i) => service(s, 0.62 + (i % 3) * 4.05, 1.66 + Math.floor(i / 3) * 2.25, 3.78, 1.92, p[1], p[2], p[0], p[3]));
  callout(s, 'Any exception to a MUST/MUST NOT control requires an ADR with named Business, Finance, Security, S/4 Architecture and Product approvals.', 0.62, 6.28, 11.92, 'faFileSignature', 'amber');
  note(s, 'These principles are the lens for all later slides and the basis for architecture sign-off.');
}

// 5 — Current trial
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Current state: a deliberately disposable vertical slice', 'The trial proves journeys and controls; it is not the productive topology.', 'CURRENT TRIAL');
  zone(s, 0.62, 1.62, 3.0, 4.82, 'USER DEVICE', C.paleBlue, C.blue, 'faLaptop');
  service(s, 1.02, 2.38, 2.2, 1.3, 'SAPUI5', 'Freestyle control tower and workbenches', 'faDisplay', C.blue);
  zone(s, 4.02, 1.62, 4.55, 4.82, 'CAP MODULAR MONOLITH', C.palePurple, C.purple, 'faCubes');
  service(s, 4.42, 2.18, 3.75, 1.0, 'OData V4 services', 'Workflow actions, validations, audit', 'faCode', C.purple);
  service(s, 4.42, 3.42, 1.76, 1.36, 'In-memory SQLite', 'Synthetic and resettable', 'faDatabase', C.red, ['TRIAL ONLY', 0.88, C.redPale, C.red]);
  service(s, 6.4, 3.42, 1.77, 1.36, 'In-process worker', 'Single-process queue', 'faGears', C.amber, ['TRIAL ONLY', 0.88, C.amberPale, C.amber]);
  service(s, 4.42, 5.02, 3.75, 1.0, 'Simulation adapters', 'No SAP calls; synthetic document IDs', 'faFlask', C.cyan);
  zone(s, 8.96, 1.62, 3.74, 4.82, 'ISOLATED DEMO DATA', 'F8FAFC', C.slate, 'faShield');
  service(s, 9.36, 2.4, 2.94, 1.18, 'Synthetic fixtures', 'Contracts, BOMs, GRs and prices', 'faTable', C.slate);
  service(s, 9.36, 3.9, 2.94, 1.18, 'Posting simulator', 'Idempotent trial evidence only', 'faReceipt', C.slate);
  callout(s, 'Persistent banner: DEMO — NOT CONNECTED TO S/4HANA', 9.36, 5.42, 2.94, 'faTriangleExclamation', 'amber');
  arrow(s, 3.22, 3.05, 4.42, 3.05, C.blue, 'HTTPS');
  arrow(s, 8.17, 4.96, 9.36, 4.96, C.purple, 'adapter');
  note(s, 'Current trial runs locally or in a trial-compatible footprint. SQLite and the in-process worker are specifically prohibited for productive scale-out.');
}

// 6 — Target landscape
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Proposed target architecture at a glance', 'Lean BTP orchestration around an authoritative, clean-core S/4HANA boundary.', 'TARGET LANDSCAPE');
  zone(s, 0.48, 1.54, 2.0, 4.95, 'ACCESS', C.paleBlue, C.blue, 'faUsers');
  service(s, 0.75, 2.2, 1.46, 1.06, 'Users', 'Buyer • Admin • Approver • Finance', 'faUsers', C.blue);
  service(s, 0.75, 3.56, 1.46, 1.06, 'IdP', 'Enterprise identity and authentication', 'faIdBadge', C.indigo);
  zone(s, 2.72, 1.54, 5.05, 4.95, 'SAP BTP — CLOUD FOUNDRY', C.palePurple, C.purple, 'faCloud');
  service(s, 3.05, 2.1, 1.9, 1.2, 'App router + SAPUI5', 'HTTPS entry and UI assets', 'faDisplay', C.blue);
  service(s, 5.16, 2.1, 2.25, 1.2, 'XSUAA / equivalent', 'Tokens, scopes and role collections', 'faShieldHalved', C.purple);
  service(s, 3.05, 3.62, 4.36, 1.34, 'CAP Node.js — stateless', 'UI APIs • orchestration • validations • exact calculations • error translation', 'faCubes', C.indigo);
  service(s, 3.05, 5.28, 2.04, 0.94, 'Destination', 'OAuth endpoints and routing', 'faRoute', C.cyan);
  service(s, 5.34, 5.28, 2.07, 0.94, 'Connectivity', 'Conditional: only if route requires', 'faNetworkWired', C.amber);
  zone(s, 8.02, 1.54, 4.82, 4.95, 'SAP S/4HANA RISE 2023', 'EEF2F7', C.navy2, 'faBuildingColumns');
  service(s, 8.36, 2.1, 1.95, 1.25, 'Released APIs', 'Supplier • material • contract • BOM • GR • UoM/FX', 'faPlug', C.blue);
  service(s, 10.56, 2.1, 1.94, 1.25, 'Clean-core ABAP service', 'Customer-owned RMC service contract', 'faCode', C.purple);
  service(s, 8.36, 3.68, 1.95, 1.38, 'Authoritative persistence', 'RMC versions • approvals • snapshots • evidence', 'faDatabase', C.indigo);
  service(s, 10.56, 3.68, 1.94, 1.38, 'Standard documents', 'Posting outcome • contract • workflow', 'faFileInvoice', C.green);
  service(s, 8.36, 5.38, 4.14, 0.84, 'S/4 authorization + accounting validation', 'Second boundary enforcement', 'faUserLock', C.slate);
  arrow(s, 2.2, 3.9, 3.05, 2.74, C.blue, 'HTTPS');
  arrow(s, 7.41, 4.28, 8.36, 3.04, C.purple, 'OAuth');
  callout(s, 'No production database binding on CAP. S/4 owns durable state.', 2.95, 6.55, 4.55, 'faDatabase', 'red');
  note(s, 'This is the primary sign-off diagram. Connectivity is conditional. Service names and API operations must be verified in the target landscape.');
}

// 7 — BTP deployment topology
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'BTP deployment topology', 'Horizontally scalable application runtime without a shadow ERP database.', 'BTP RUNTIME');
  zone(s, 0.62, 1.58, 12.0, 4.98, 'CLOUD FOUNDRY SPACE', 'F5F3FF', C.purple, 'faCloud');
  service(s, 1.0, 2.2, 2.25, 1.25, 'Route + app router', 'TLS termination • session entry • UI hosting', 'faGlobe', C.blue);
  service(s, 3.65, 2.2, 2.25, 1.25, 'CAP instance A', 'Stateless API and orchestration', 'faCube', C.indigo);
  service(s, 6.2, 2.2, 2.25, 1.25, 'CAP instance B…N', 'Horizontal scale after durable job design', 'faCubes', C.indigo);
  service(s, 9.05, 2.2, 2.9, 1.25, 'Service bindings', 'XSUAA/equivalent • Destination • optional Connectivity', 'faLink', C.purple);
  arrow(s, 3.25, 2.83, 3.65, 2.83, C.blue);
  arrow(s, 5.9, 2.83, 6.2, 2.83, C.blue);
  service(s, 1.0, 4.02, 3.1, 1.28, 'Ephemeral memory only', 'Caches and temporary processing must be bounded and recoverable.', 'faMemory', C.amber);
  service(s, 4.38, 4.02, 3.1, 1.28, 'Durable business state', 'Stored behind approved S/4 extension services.', 'faBuildingColumns', C.green);
  service(s, 7.76, 4.02, 4.19, 1.28, 'Long-running work', 'Checkpoint in S/4 or an already-entitled platform mechanism before multi-instance processing.', 'faClockRotateLeft', C.cyan);
  callout(s, 'Explicitly absent: HANA Cloud, CAP production SQLite, local filesystem state and in-process-only queue ownership.', 1.0, 5.68, 10.95, 'faBan', 'red');
  note(s, 'The exact number of instances and memory/CPU sizing remain subject to volume and performance testing.');
}

// 8 — Service decision matrix
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'BTP service decision matrix', 'A small allow-list is intentional; optional services are decisions, not assumptions.', 'SERVICE GOVERNANCE');
  const cols = [
    { x: 0.62, w: 3.82, color: C.green, fill: C.greenPale, label: 'BASELINE ALLOW-LIST', icon: 'faCircleCheck', rows: [
      ['Cloud Foundry runtime', 'Application runtime'], ['XSUAA / approved equivalent', 'Authorization and trust'], ['Destination service', 'Governed endpoint/OAuth configuration']
    ] },
    { x: 4.76, w: 3.82, color: C.amber, fill: C.amberPale, label: 'CONDITIONAL', icon: 'faCodeBranch', rows: [
      ['Connectivity service', 'Only if RISE routing requires'], ['Enterprise IdP / IAS pattern', 'Confirm existing landscape'], ['Durable platform job mechanism', 'Only if already entitled and selected']
    ] },
    { x: 8.9, w: 3.82, color: C.red, fill: C.redPale, label: 'NOT BASELINE', icon: 'faBan', rows: [
      ['HANA Cloud', 'Prohibited by baseline'], ['Integration Suite / Event Mesh', 'Costed ADR required'], ['Build Process Automation', 'Costed ADR required'], ['DMS / Alert Notification / paid tools', 'Costed ADR required']
    ] }
  ];
  cols.forEach((c) => {
    round(s, c.x, 1.68, c.w, 4.82, C.white, C.border);
    round(s, c.x, 1.68, c.w, 0.67, c.fill, c.fill);
    badge(s, c.icon, c.x + 0.2, 1.84, c.color, 0.34);
    text(s, c.label, c.x + 0.66, 1.8, c.w - 0.86, 0.3, { fontSize: 9, bold: true, color: c.color });
    c.rows.forEach((r, i) => {
      const y = 2.58 + i * 0.9;
      badge(s, i === 0 ? 'faCloud' : 'faPuzzlePiece', c.x + 0.23, y + 0.06, c.color, 0.3);
      text(s, r[0], c.x + 0.66, y, c.w - 0.88, 0.28, { fontSize: 9.3, bold: true, color: C.navy });
      text(s, r[1], c.x + 0.66, y + 0.31, c.w - 0.88, 0.31, { fontSize: 8.2, color: C.slate });
    });
  });
  callout(s, 'Every proposed service must document entitlement, forecast consumption, support owner and exit/removal plan.', 0.86, 6.63, 11.62, 'faCoins', 'purple');
  note(s, 'Leadership should explicitly approve the allow-list and the ADR requirement for additions.');
}

// 9 — Request flow
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'End-to-end request and trust flow', 'Identity, authorization and correlation remain visible across every boundary.', 'RUNTIME FLOW');
  const steps = [
    ['faUser', '1. Authenticate', 'Enterprise identity establishes the user.'],
    ['faDisplay', '2. Enter UI', 'App router serves SAPUI5 over HTTPS.'],
    ['faKey', '3. Authorize', 'XSUAA/equivalent issues scopes and roles.'],
    ['faCubes', '4. Orchestrate', 'CAP validates persona + organization.'],
    ['faRoute', '5. Resolve route', 'Destination supplies endpoint and OAuth policy.'],
    ['faPlug', '6. Call S/4', 'Released API or approved custom service.'],
    ['faFileShield', '7. Retain evidence', 'Response, status, hash and correlation ID.']
  ];
  steps.forEach((st, i) => {
    const x = 0.52 + i * 1.82;
    round(s, x, 1.96, 1.54, 2.75, C.white, C.border);
    badge(s, st[0], x + 0.48, 2.23, [C.blue, C.indigo, C.purple, C.violet, C.cyan, C.blue, C.green][i], 0.58);
    text(s, st[1], x + 0.12, 3.03, 1.3, 0.46, { fontSize: 10.2, bold: true, color: C.navy, align: 'center' });
    text(s, st[2], x + 0.14, 3.65, 1.26, 0.7, { fontSize: 8.1, color: C.slate, align: 'center', valign: 'top' });
    if (i < steps.length - 1) arrow(s, x + 1.54, 3.28, x + 1.8, 3.28, C.violet);
  });
  callout(s, 'GET may use controlled retry. Mutations require idempotency and status inquiry — never blind retry after an ambiguous timeout.', 0.74, 5.24, 11.62, 'faRotate', 'amber');
  callout(s, 'A correlation ID must travel from UI through CAP to S/4 and back into operational evidence.', 0.74, 5.92, 11.62, 'faFingerprint', 'blue');
  note(s, 'This slide explains the main runtime sequence without implying a specific unreleased S/4 API.');
}

// 10 — Ownership boundary
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Clear ownership prevents a shadow ERP', 'CAP composes the experience; S/4 owns enterprise truth and durable business state.', 'RESPONSIBILITY MODEL');
  zone(s, 0.62, 1.58, 5.78, 4.98, 'CAP MUST OWN', C.palePurple, C.purple, 'faCubes');
  bulletRows(s, [
    ['faDisplay', 'Purpose-built APIs, value help and search composition'],
    ['faDiagramProject', 'Cross-service orchestration and business validation'],
    ['faCalculator', 'Calculation execution when volume testing supports it'],
    ['faUserCheck', 'User-facing workflow actions and CAP authorization'],
    ['faFingerprint', 'Idempotent calls, canonical mapping and error translation']
  ], 1.0, 2.38, 4.95, 0.65, C.purple);
  zone(s, 6.92, 1.58, 5.78, 4.98, 'S/4HANA MUST OWN', 'EEF2F7', C.navy2, 'faBuildingColumns');
  bulletRows(s, [
    ['faAddressBook', 'Supplier, material, purchasing and BOM authority'],
    ['faTruckRampBox', 'Goods receipts, currencies, UoM and accounting context'],
    ['faDatabase', 'Customer-owned RMC persistence and immutable evidence'],
    ['faFileInvoice', 'Final standard documents and posting validations'],
    ['faStamp', 'Standard workflow/change documents where applicable']
  ], 7.3, 2.38, 4.95, 0.65, C.navy2);
  callout(s, 'Duplication is limited to immutable calculation snapshots, posting evidence or explicitly approved performance projections.', 2.0, 6.62, 9.35, 'faCopy', 'amber');
  note(s, 'Use this ownership boundary to resolve future design disputes and data duplication proposals.');
}

// 11 — Interface map
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'S/4 interface map — candidates to verify', 'Interface areas are known; technical API names and release status are not approved until proven in the target system.', 'INTEGRATION');
  const domains = [
    ['faAddressBook', 'Supplier / BP', 'Read authoritative identity and scope'],
    ['faBox', 'Product / material', 'Read part, plant, UoM and status'],
    ['faFileContract', 'Purchase contract', 'Read conditions; simulate/update after approval'],
    ['faSitemap', 'Bill of material', 'Explosion semantics and immutable snapshot'],
    ['faTruckRampBox', 'Material document / GR', 'Eligible quantity, reversals and references'],
    ['faMoneyBillTransfer', 'Posting outcome', 'Supplier adjustment or journal path — spike required'],
    ['faCoins', 'Currency / UoM', 'Governed conversion and rate semantics'],
    ['faCode', 'Custom RMC service', 'Masters, versions, approvals, evidence and status']
  ];
  domains.forEach((d, i) => service(s, 0.62 + (i % 4) * 3.03, 1.66 + Math.floor(i / 4) * 2.28, 2.78, 1.95, d[1], d[2], d[0], [C.blue, C.purple, C.indigo, C.cyan][i % 4], ['VERIFY', 0.7, C.amberPale, C.amber]));
  callout(s, 'Verification sources: actual S/4HANA 2023 edition/FPS, released-object status, SAP Business Accelerator Hub and non-production feasibility spikes.', 0.62, 6.35, 11.92, 'faMagnifyingGlass', 'amber');
  note(s, 'Do not interpret this as an approved API list. It is the verification catalogue for Productive Gate P1.');
}

// 12 — Ports and adapters
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Ports and adapters preserve the investment', 'Trial adapters are replaceable; domain behavior and UI contracts remain stable.', 'CLEAN-CORE DESIGN');
  zone(s, 0.62, 1.62, 3.05, 4.85, 'APPLICATION CORE', C.palePurple, C.purple, 'faGem');
  service(s, 0.98, 2.26, 2.33, 1.12, 'Domain logic', 'Formulas • invariants • state transitions', 'faCalculator', C.purple);
  service(s, 0.98, 3.68, 2.33, 1.12, 'Stable contracts', 'Canonical models • UI APIs • tests', 'faFileCode', C.indigo);
  zone(s, 4.0, 1.62, 3.98, 4.85, 'APPLICATION PORTS', C.paleBlue, C.blue, 'faEthernet');
  const ports = [
    ['S4ReferenceDataPort', 'faBookOpen'], ['RmcRepositoryPort', 'faDatabase'], ['PostingPort', 'faReceipt'],
    ['ContractUpdatePort', 'faFileContract'], ['IdentityAuthorizationPort', 'faUserLock']
  ];
  ports.forEach((p, i) => service(s, 4.34, 2.18 + i * 0.76, 3.3, 0.62, p[0], '', p[1], i % 2 ? C.indigo : C.blue));
  zone(s, 8.32, 1.62, 4.38, 4.85, 'ADAPTERS', 'F8FAFC', C.slate, 'faPlug');
  service(s, 8.68, 2.25, 1.67, 1.48, 'Trial', 'Seeded repository • mock reference • posting simulator', 'faFlask', C.cyan);
  service(s, 10.63, 2.25, 1.67, 1.48, 'Productive', 'Released APIs • clean-core service • supported posting', 'faBuildingColumns', C.purple);
  service(s, 8.68, 4.15, 3.62, 1.28, 'Canonical mapping boundary', 'SAP technical payload names do not leak into UI or financial formulas.', 'faArrowsLeftRight', C.indigo);
  arrow(s, 3.31, 3.98, 4.34, 3.98, C.purple, 'calls');
  arrow(s, 7.64, 3.98, 8.68, 3.98, C.blue, 'binds');
  note(s, 'This architecture minimizes rewrite after the trial and makes productive interfaces contract-testable.');
}

// 13 — Data architecture
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Data ownership, snapshots and retention', 'Current truth stays authoritative; approved calculations remain reproducible.', 'DATA ARCHITECTURE');
  const lanes = [
    { y: 1.7, color: C.blue, icon: 'faBookOpen', title: 'Authoritative reference', body: 'Supplier • material • contract • BOM • GR • currencies • UoM', owner: 'S/4 standard' },
    { y: 2.82, color: C.purple, icon: 'faDatabase', title: 'RMC-owned durable records', body: 'RM masters • linkages • profiles • prices • requests • approvals', owner: 'S/4 extension' },
    { y: 3.94, color: C.indigo, icon: 'faCamera', title: 'Immutable calculation evidence', body: 'Input snapshots • formula/rule version • result lines • hashes', owner: 'S/4 extension' },
    { y: 5.06, color: C.green, icon: 'faReceipt', title: 'Execution and reconciliation', body: 'Idempotency key • SAP response • document • reversal • difference', owner: 'S/4 + evidence' }
  ];
  lanes.forEach((l) => {
    round(s, 0.68, l.y, 11.9, 0.88, C.white, C.border);
    badge(s, l.icon, 0.92, l.y + 0.19, l.color, 0.5);
    text(s, l.title, 1.62, l.y + 0.14, 2.52, 0.3, { fontSize: 10.5, bold: true, color: C.navy });
    text(s, l.body, 4.22, l.y + 0.12, 5.55, 0.4, { fontSize: 8.8, color: C.slate });
    pill(s, l.owner, 10.15, l.y + 0.25, 1.98, l.color);
  });
  callout(s, 'CAP may use bounded ephemeral caches, but it must not become the production system of record or retain unrecoverable state.', 0.68, 6.28, 11.9, 'faDatabase', 'red');
  note(s, 'Retention periods and content-repository requirements remain open decisions for Finance, Legal and Records Management.');
}

// 14 — Security
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Identity, authorization and segregation of duties', 'Enforcement is layered: enterprise identity, CAP business scope and S/4 authority.', 'SECURITY');
  zone(s, 0.62, 1.62, 3.64, 4.88, 'IDENTITY & TRUST', C.paleBlue, C.blue, 'faIdCard');
  service(s, 0.98, 2.28, 2.92, 1.2, 'Enterprise identity', 'Named users • MFA/policy • no shared personal accounts', 'faUserShield', C.blue);
  service(s, 0.98, 3.8, 2.92, 1.2, 'XSUAA / equivalent', 'Scopes • role collections • technical identities', 'faKey', C.purple);
  zone(s, 4.54, 1.62, 3.64, 4.88, 'CAP ENFORCEMENT', C.palePurple, C.purple, 'faShieldHalved');
  service(s, 4.9, 2.28, 2.92, 1.2, 'Business personas', 'Maintain • submit • approve • post • audit', 'faUsersGear', C.purple);
  service(s, 4.9, 3.8, 2.92, 1.2, 'Organizational scope', 'Company • purchasing org • plant • supplier group', 'faSitemap', C.indigo);
  zone(s, 8.46, 1.62, 4.22, 4.88, 'S/4 ENFORCEMENT', 'EEF2F7', C.navy2, 'faBuildingColumns');
  service(s, 8.82, 2.28, 3.5, 1.2, 'S/4 authorization', 'Released service and business-object authorization', 'faUserLock', C.navy2);
  service(s, 8.82, 3.8, 3.5, 1.2, 'Accounting controls', 'Period • company code • document validation', 'faScaleBalanced', C.green);
  callout(s, 'Maker and approver must differ for financially relevant changes; emergency access follows enterprise firefighter controls.', 0.98, 5.56, 11.34, 'faPeopleArrowsLeftRight', 'amber');
  note(s, 'The trial dummy identity demonstrates all personas and is explicitly not a production control.');
}

// 15 — Network
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Network and connectivity options', 'Choose the simplest secure route proven by the actual RISE landscape.', 'CONNECTIVITY');
  service(s, 0.72, 2.18, 2.12, 1.4, 'CAP on BTP', 'Outbound HTTPS via Destination', 'faCloud', C.purple);
  service(s, 5.58, 1.66, 2.22, 1.45, 'Route A — direct', 'Public/reachable released endpoint with OAuth and enterprise controls', 'faGlobe', C.green, ['PREFERRED IF VALID', 1.25, C.greenPale, C.green]);
  service(s, 5.58, 4.06, 2.22, 1.45, 'Route B — private', 'Destination + Connectivity + approved network bridge', 'faNetworkWired', C.amber, ['CONDITIONAL', 1.0, C.amberPale, C.amber]);
  service(s, 10.2, 2.74, 2.28, 1.55, 'S/4HANA RISE', 'Released API and clean-core service endpoints', 'faBuildingColumns', C.indigo);
  arrow(s, 2.84, 2.87, 5.58, 2.39, C.green, 'OAuth');
  arrow(s, 7.8, 2.39, 10.2, 3.24, C.green, 'HTTPS');
  arrow(s, 2.84, 2.99, 5.58, 4.78, C.amber, 'conditional');
  arrow(s, 7.8, 4.78, 10.2, 3.75, C.amber, 'private');
  callout(s, 'Decision inputs: S/4 edition/FPS, endpoint exposure, certificate/OAuth pattern, RISE network policy, latency and support ownership.', 1.08, 5.92, 11.0, 'faListCheck', 'blue');
  callout(s, 'Connectivity service is not automatic; adopt it only when the proven network route requires it.', 2.42, 6.49, 8.3, 'faCoins', 'amber');
  note(s, 'This slide intentionally presents two alternatives. Network architecture must be confirmed at Transition Gate T3.');
}

// 16 — Workflow authority
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Workflow authority and business-document truth', 'Avoid duplicate approvals and false “final” status across the custom app and S/4.', 'WORKFLOW');
  const phases = [
    ['faPenToSquare', 'Draft and validate', 'CAP domain state machine', C.blue],
    ['faUserCheck', 'Business approval', 'CAP or S/4 — decision required', C.purple],
    ['faPaperPlane', 'Execute', 'Released S/4 interface', C.indigo],
    ['faStamp', 'Final authority', 'S/4 workflow/document status', C.green],
    ['faScaleBalanced', 'Reconcile', 'CAP view of reread S/4 truth', C.cyan]
  ];
  phases.forEach((p, i) => {
    const x = 0.72 + i * 2.48;
    service(s, x, 2.05, 2.12, 2.2, p[1], p[2], p[0], p[3]);
    if (i < phases.length - 1) arrow(s, x + 2.12, 3.15, x + 2.42, 3.15, C.violet);
  });
  callout(s, 'If S/4 Flexible Workflow governs contract release, RMC must not display “finally approved” until S/4 confirms it.', 0.72, 4.86, 11.52, 'faTriangleExclamation', 'amber');
  callout(s, 'OQ-10 requires leadership/business confirmation: custom app, S/4 Flexible Workflow, or both — with one authoritative final state.', 0.72, 5.55, 11.52, 'faCircleQuestion', 'purple');
  note(s, 'The lightweight CAP workflow is the cost-minimized baseline for application-level decisions; final S/4 approvals remain authoritative when applicable.');
}

// 17 — Scale and jobs
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Scale and long-running calculation design', 'Horizontal CAP scale is enabled only after durable coordination replaces the trial worker.', 'SCALABILITY');
  service(s, 0.72, 2.0, 2.1, 1.5, 'Submit work', 'Validated run definition and immutable cutoff', 'faPlay', C.blue);
  service(s, 3.2, 2.0, 2.1, 1.5, 'Durable checkpoint', 'S/4 extension or approved entitled mechanism', 'faDatabase', C.purple);
  service(s, 5.68, 2.0, 2.1, 1.5, 'Claim + lease', 'Atomic claim • heartbeat • stale recovery', 'faKey', C.indigo);
  service(s, 8.16, 2.0, 2.1, 1.5, 'Chunk processing', 'Set-based reads • bounded S/4 calls • progress', 'faLayerGroup', C.cyan);
  service(s, 10.64, 2.0, 2.0, 1.5, 'Finalize', 'Immutable result • approval-ready totals', 'faFlagCheckered', C.green);
  for (let i = 0; i < 4; i += 1) arrow(s, 2.82 + i * 2.48, 2.75, 3.2 + i * 2.48, 2.75, C.violet);
  zone(s, 0.72, 4.08, 5.78, 1.85, 'VOLUME CONTROLS', C.paleBlue, C.blue, 'faGaugeHigh');
  bulletRows(s, [['faFilter', '$select, filtering, pagination and batching'], ['faBoxesStacked', 'No one-remote-call-per-row pattern'], ['faChartLine', 'Test throughput, payload limits and S/4 call-rate budget']], 1.05, 4.67, 5.05, 0.38, C.blue);
  zone(s, 6.84, 4.08, 5.78, 1.85, 'RECOVERY CONTROLS', C.palePurple, C.purple, 'faClockRotateLeft');
  bulletRows(s, [['faRotate', 'Safe retry and stale-lease recovery'], ['faLink', 'Rerun lineage without overwriting source'], ['faFingerprint', 'Idempotent execution and posting keys']], 7.18, 4.67, 5.05, 0.38, C.purple);
  callout(s, 'Required inputs still open: contracts, parts, BOM depth, GR lines/month, vendors, users and peak-period concurrency.', 1.18, 6.32, 10.95, 'faChartColumn', 'amber');
  note(s, 'The trial processes one run at a time. Productive concurrency is a design outcome of NFR and feasibility testing.');
}

// 18 — Reliability
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Reliability, idempotency and reconciliation', 'Financial operations are designed for ambiguity, reversal and proof — not optimistic retries.', 'CONTROL ARCHITECTURE');
  const controls = [
    ['faCamera', 'Freeze inputs', 'Business date, cutoff, versions and rule set'],
    ['faFingerprint', 'Identify uniquely', 'Business object + immutable idempotency key'],
    ['faShieldHalved', 'Precheck', 'Authorization, period and business validation'],
    ['faPaperPlane', 'Send once', 'Persist request hash before mutation'],
    ['faMagnifyingGlass', 'Resolve ambiguity', 'Status inquiry after timeout; no blind retry'],
    ['faRotateLeft', 'Reverse safely', 'New linked record; original remains immutable'],
    ['faScaleBalanced', 'Reconcile', 'Calculated = excluded + pending + posted + failed + reversed']
  ];
  controls.forEach((c, i) => {
    const x = 0.5 + i * 1.82;
    round(s, x, 1.86, 1.56, 3.2, C.white, C.border);
    badge(s, c[0], x + 0.49, 2.15, [C.blue, C.indigo, C.purple, C.violet, C.cyan, C.amber, C.green][i], 0.56);
    text(s, c[1], x + 0.14, 2.99, 1.28, 0.42, { fontSize: 10, bold: true, color: C.navy, align: 'center' });
    text(s, c[2], x + 0.14, 3.55, 1.28, 0.98, { fontSize: 8.1, color: C.slate, align: 'center', valign: 'top' });
    if (i < controls.length - 1) arrow(s, x + 1.56, 3.35, x + 1.8, 3.35, C.violet);
  });
  callout(s, 'Daily/period-close totals must reconcile by company code, supplier, currency, posting period and SAP document.', 0.72, 5.53, 11.55, 'faCalendarCheck', 'green');
  callout(s, 'Support corrections use governed actions — never direct table editing.', 2.6, 6.2, 7.8, 'faScrewdriverWrench', 'red');
  note(s, 'This control chain is required regardless of the final posting interface selected in the feasibility spike.');
}

// 19 — Operations
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Operations and support architecture', 'Use built-in runtime telemetry and existing enterprise tooling before adding paid platform services.', 'OPERATIONS');
  zone(s, 0.62, 1.62, 3.76, 4.88, 'SIGNALS', C.paleBlue, C.blue, 'faWaveSquare');
  bulletRows(s, [
    ['faFingerprint', 'Correlation IDs and structured business events'],
    ['faTriangleExclamation', 'Failed remote calls and posting ambiguity'],
    ['faClock', 'Stuck workflow, lease and calculation age'],
    ['faScaleBalanced', 'Reconciliation differences and outstanding totals']
  ], 1.02, 2.48, 2.95, 0.72, C.blue);
  zone(s, 4.78, 1.62, 3.76, 4.88, 'OBSERVABILITY', C.palePurple, C.purple, 'faChartLine');
  bulletRows(s, [
    ['faTerminal', 'Cloud Foundry stdout/stderr and platform metrics'],
    ['faGaugeHigh', 'Approved enterprise monitoring integration'],
    ['faBell', 'Alert routing through existing entitled capability'],
    ['faLock', 'No tokens, credentials or full financial payloads in logs']
  ], 5.18, 2.48, 2.95, 0.72, C.purple);
  zone(s, 8.94, 1.62, 3.76, 4.88, 'RUNBOOKS', 'EEF2F7', C.navy2, 'faBook');
  bulletRows(s, [
    ['faPlugCircleXmark', 'Remote outage and expired credentials'],
    ['faCircleQuestion', 'Ambiguous posting and status inquiry'],
    ['faBoxesStacked', 'Partial batch failure and duplicate prevention'],
    ['faCalendarXmark', 'Period closure and reconciliation break']
  ], 9.34, 2.48, 2.95, 0.72, C.navy2);
  callout(s, 'Alert Notification, Application Logging or third-party paid tooling is not assumed; additions require entitlement/cost review and, where applicable, ADR approval.', 0.98, 6.6, 11.34, 'faCoins', 'amber');
  note(s, 'Operations design must name support owners, service levels, retention and escalation paths before Productive Gate P2.');
}

// 20 — Cost governance
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Cost and entitlement governance', 'Minimum BTP cost is enforced through decisions, measurements and exit plans.', 'FINOPS');
  const flow = [
    ['faLightbulb', 'Need identified', 'Business/NFR evidence'],
    ['faScaleBalanced', 'Options compared', 'Reuse • build • service'],
    ['faReceipt', 'Costed ADR', 'Consumption + S/4 effort'],
    ['faUserTie', 'Owners approve', 'Architecture • Finance • Product'],
    ['faGaugeHigh', 'Measure usage', 'Quota • spend • performance'],
    ['faDoorOpen', 'Exit plan', 'Remove, replace or downscale']
  ];
  flow.forEach((f, i) => {
    const x = 0.66 + i * 2.06;
    service(s, x, 1.88, 1.78, 2.4, f[1], f[2], f[0], [C.blue, C.indigo, C.purple, C.violet, C.cyan, C.green][i]);
    if (i < flow.length - 1) arrow(s, x + 1.78, 3.08, x + 2.02, 3.08, C.violet);
  });
  zone(s, 0.76, 4.75, 5.62, 1.4, 'MONTHLY SERVICE RECORD', C.paleBlue, C.blue, 'faFileInvoiceDollar');
  text(s, 'Entitlement • forecast consumption • unit economics • owner • actual usage • renewal date', 1.08, 5.3, 4.98, 0.4, { fontSize: 9.2, color: C.slate, align: 'center' });
  zone(s, 6.92, 4.75, 5.62, 1.4, 'TOTAL COST VIEW', C.palePurple, C.purple, 'faCoins');
  text(s, 'BTP runtime + S/4 extension delivery + storage + operations + upgrade regression', 7.24, 5.3, 4.98, 0.4, { fontSize: 9.2, color: C.slate, align: 'center' });
  callout(s, '“Free in trial” is not sufficient justification for a productive dependency.', 3.0, 6.4, 7.3, 'faTriangleExclamation', 'amber');
  note(s, 'Total cost includes the S/4 extension and operations burden, while the no-HANA-Cloud constraint remains binding.');
}

// 21 — Roadmap gates
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Architecture decisions are released through gates', 'Each gate authorizes a bounded next step; none may be inferred from demo success.', 'DELIVERY ROADMAP');
  const gates = [
    ['T1', 'Demonstrator', 'Synthetic end-to-end evidence', C.blue],
    ['T2', 'Scope convergence', '≥90% product definition accepted', C.indigo],
    ['T3', 'Real-landscape authorization', 'Identity, cost, transport and security design', C.purple],
    ['P0', 'Landscape confirmation', 'Edition/FPS, Vistex and licensing facts', C.violet],
    ['P1', 'Feasibility spikes', 'APIs, BOM, GR, persistence, posting and contract update', C.cyan],
    ['P2–P5', 'Productive delivery', 'Foundation → master/content → pricing → execution', C.green]
  ];
  gates.forEach((g, i) => {
    const x = 0.62 + i * 2.05;
    round(s, x, 1.84, 1.77, 3.45, C.white, C.border);
    pill(s, g[0], x + 0.46, 2.12, 0.85, g[3]);
    badge(s, i < 2 ? 'faCircleCheck' : 'faLock', x + 0.65, 2.8, g[3], 0.48);
    text(s, g[1], x + 0.15, 3.52, 1.47, 0.52, { fontSize: 10.2, bold: true, color: C.navy, align: 'center' });
    text(s, g[2], x + 0.16, 4.18, 1.45, 0.72, { fontSize: 7.9, color: C.slate, align: 'center', valign: 'top' });
    if (i < gates.length - 1) arrow(s, x + 1.77, 3.12, x + 2.01, 3.12, C.violet);
  });
  callout(s, 'Current position: T1 technical evidence is complete; human acceptance and T1/T2 decisions remain pending.', 0.82, 5.65, 11.45, 'faLocationDot', 'blue');
  callout(s, 'No real S/4 connectivity or real business data before formal T3 approval.', 2.1, 6.3, 8.9, 'faLock', 'red');
  note(s, 'Architecture sign-off should not collapse the delivery gates. Productive Gate P1 must prove both posting paths before broader build.');
}

// 22 — Risks
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Top architecture risks and built-in mitigations', 'The largest uncertainties are explicit and tied to gates, tests and named decisions.', 'RISK VIEW');
  const risks = [
    ['faPlugCircleXmark', 'Released interface unavailable', 'P1 feasibility spike; clean-core gap decision', 'HIGH', C.red],
    ['faMoneyBillTransfer', 'MRNB-equivalent outcome unclear', 'Finance classification + supported-interface proof', 'HIGH', C.red],
    ['faChartColumn', 'Volume exceeds CAP/S4 pattern', 'NFR baseline + performance spike + durable jobs', 'HIGH', C.red],
    ['faPeopleArrowsLeftRight', 'Duplicate approval authority', 'OQ-10 decision + one final authoritative state', 'MED', C.amber],
    ['faNetworkWired', 'RISE route requires extra service', 'T3 network proof; Connectivity only if required', 'MED', C.amber],
    ['faCoins', 'Service sprawl / recurring cost', 'Allow-list + costed ADR + monthly consumption record', 'MED', C.amber],
    ['faDatabase', 'Shadow ERP duplication', 'S/4 ownership boundary + no CAP production DB', 'HIGH', C.red],
    ['faShieldHalved', 'Authorization gap', 'Layered role/org scope + SoD and contract tests', 'MED', C.amber]
  ];
  risks.forEach((r, i) => {
    const x = 0.62 + (i % 2) * 6.1, y = 1.65 + Math.floor(i / 2) * 1.18;
    round(s, x, y, 5.82, 0.98, C.white, C.border);
    badge(s, r[0], x + 0.2, y + 0.25, r[4], 0.42);
    text(s, r[1], x + 0.78, y + 0.13, 2.0, 0.28, { fontSize: 9.5, bold: true, color: C.navy });
    text(s, r[2], x + 2.75, y + 0.12, 2.25, 0.52, { fontSize: 8.1, color: C.slate, valign: 'top' });
    pill(s, r[3], x + 5.07, y + 0.31, 0.53, r[4]);
  });
  callout(s, 'Residual risk acceptance belongs to the named architecture/business authority — not to implementation teams by assumption.', 0.86, 6.48, 11.55, 'faUserTie', 'purple');
  note(s, 'Use this as an initial leadership risk register; assign owners and dates during sign-off.');
}

// 23 — Open decisions
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Decisions required to complete productive architecture', 'These questions can materially change integration, security, scale or accounting design.', 'DECISION REGISTER');
  const decisions = [
    ['Landscape', 'S/4 edition/FPS, BTP subaccount/region, entitlements and identity model'],
    ['Posting', 'Accrual, subsequent debit/credit, revaluation or combination'],
    ['BOM + GR', 'Explosion semantics, movement types, cutoff/date basis and volumes'],
    ['Pricing', 'Index/lag/FX/premiums, price units, rounding and non-RM balance'],
    ['Workflow', 'Final approval in RMC, S/4 Flexible Workflow or both'],
    ['Records', 'Evidence repository, retention, tax and fiscal-close requirements'],
    ['Network', 'Direct OAuth route or private Connectivity route'],
    ['Operations', 'Service levels, durable job mechanism, monitoring and support ownership']
  ];
  decisions.forEach((d, i) => {
    const x = 0.62 + (i % 2) * 6.1, y = 1.63 + Math.floor(i / 2) * 1.2;
    round(s, x, y, 5.82, 1.0, C.white, C.border);
    badge(s, 'faCircleQuestion', x + 0.2, y + 0.26, i % 2 ? C.purple : C.blue, 0.42);
    text(s, d[0], x + 0.78, y + 0.14, 1.16, 0.28, { fontSize: 9.6, bold: true, color: C.navy });
    text(s, d[1], x + 1.88, y + 0.12, 3.66, 0.57, { fontSize: 8.3, color: C.slate, valign: 'top' });
  });
  callout(s, 'Full binding register: OQ-01 through OQ-15 in PROJECT_GUIDELINES.md.', 2.62, 6.47, 8.1, 'faListCheck', 'blue');
  note(s, 'Convert each item into an owned decision with evidence, due date and gate. Do not silently resolve unknowns in code.');
}

// 24 — Sign-off record
{
  const s = pptx.addSlide('ARCH_MASTER');
  title(s, 'Architecture sign-off record', 'Recommended decision: conditional approval of direction and guardrails.', 'LEADERSHIP APPROVAL');
  const choices = [
    ['faCircleCheck', 'APPROVE', 'Architecture direction and constraints accepted', C.green],
    ['faCircleHalfStroke', 'CONDITIONAL APPROVAL', 'Accepted subject to recorded conditions and gates', C.purple],
    ['faRotateLeft', 'REWORK', 'Return with specific architecture changes', C.amber],
    ['faCircleXmark', 'REJECT', 'Direction not accepted; reason required', C.red]
  ];
  choices.forEach((c, i) => service(s, 0.62 + i * 3.03, 1.64, 2.78, 1.48, c[1], c[2], c[0], c[3]));
  const roles = ['Product / Business', 'Purchasing', 'Finance', 'Security', 'S/4 Architecture', 'BTP Platform / Operations'];
  roles.forEach((r, i) => {
    const x = 0.62 + (i % 3) * 4.05, y = 3.5 + Math.floor(i / 3) * 1.18;
    round(s, x, y, 3.78, 0.96, C.white, C.border);
    badge(s, ['faUserTie', 'faCartShopping', 'faCoins', 'faShieldHalved', 'faBuildingColumns', 'faCloud'][i], x + 0.18, y + 0.23, [C.blue, C.purple, C.indigo, C.red, C.navy2, C.cyan][i], 0.42);
    text(s, r, x + 0.76, y + 0.12, 1.88, 0.34, { fontSize: 8.7, bold: true, color: C.navy });
    text(s, 'Name: ______________', x + 2.58, y + 0.12, 0.98, 0.22, { fontSize: 6.9, color: C.muted });
    text(s, 'Decision/date: _______', x + 2.58, y + 0.48, 0.98, 0.22, { fontSize: 6.9, color: C.muted });
  });
  callout(s, 'Conditions / ADRs / decisions: ______________________________________________________________________________________', 0.62, 6.03, 11.92, 'faPen', 'purple');
  callout(s, 'This approval does not authorize BTP deployment, real data, non-production S/4 connectivity or productive posting; those remain gate-controlled.', 0.62, 6.62, 11.92, 'faLock', 'red');
  note(s, 'Capture the meeting decision, named approvers, conditions and target gate. Store the signed record in the approved document repository.');
}

pptx._slides.forEach((slide, index) => {
  if (!slide._notes || slide._notes.length === 0) note(slide, `Slide ${index + 1}. Proposed architecture based on PROJECT_GUIDELINES.md v0.2.0. No productive S/4 connectivity, real data or deployment is authorized by this material.`);
});

const slideLimit = Number(process.env.RMC_ARCH_SLIDE_LIMIT || 0);
if (slideLimit > 0) pptx._slides = pptx._slides.slice(0, slideLimit);

pptx.writeFile({ fileName: OUT })
  .then(() => console.log(`Created ${OUT}`))
  .catch((error) => { console.error(error); process.exitCode = 1; });
