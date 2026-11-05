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
pptx.subject = 'Business overview and user handbook for the RMC application';
pptx.title = 'Raw Material Content Management — Business Deck & User Handbook';
pptx.lang = 'en-IN';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'en-IN'
};
pptx.defineSlideMaster({
  title: 'RMC_MASTER',
  background: { color: 'F7F8FC' },
  objects: [
    { rect: { x: 0, y: 0, w: 0.16, h: 7.5, fill: { color: '5B21B6' }, line: { color: '5B21B6' } } },
    { rect: { x: 0.16, y: 0, w: 4.35, h: 0.055, fill: { color: '2563EB' }, line: { color: '2563EB' } } },
    { rect: { x: 4.51, y: 0, w: 4.35, h: 0.055, fill: { color: '6D28D9' }, line: { color: '6D28D9' } } },
    { rect: { x: 8.86, y: 0, w: 4.47, h: 0.055, fill: { color: '0EA5E9' }, line: { color: '0EA5E9' } } },
    { line: { x: 0.45, y: 7.12, w: 12.42, h: 0, line: { color: 'DDE3F0', width: 1 } } },
    { text: { text: 'RAW MATERIAL CONTENT MANAGEMENT', options: { x: 0.52, y: 7.18, w: 5.5, h: 0.16, fontFace: 'Aptos', fontSize: 6.8, bold: true, color: '64748B', charSpacing: 1.3, margin: 0 } } },
    { text: { text: 'DEMO — NOT CONNECTED TO S/4HANA', options: { x: 8.15, y: 7.18, w: 4.62, h: 0.16, fontFace: 'Aptos', fontSize: 6.8, bold: true, color: '7C3AED', align: 'right', margin: 0 } } }
  ],
  slideNumber: { x: 12.88, y: 7.15, w: 0.25, h: 0.18, fontFace: 'Aptos', fontSize: 7, color: '64748B', align: 'right', margin: 0 }
});

const C = {
  navy: '0B1F3A', blue: '2563EB', blue2: '0EA5E9', purple: '6D28D9', violet: '8B5CF6',
  indigo: '4338CA', cyan: '06B6D4', white: 'FFFFFF', ink: '172033', muted: '64748B',
  pale: 'EEF2FF', paleBlue: 'EAF2FF', palePurple: 'F1EAFE', border: 'DDE3F0', bg: 'F7F8FC',
  green: '059669', greenPale: 'DDF7EC', amber: 'D97706', amberPale: 'FFF3D6', red: 'DC2626', redPale: 'FEE2E2',
  slate: '334155', light: 'F8FAFC'
};

const OUT = path.resolve(__dirname, '..', 'docs', 'RMC_Application_Business_Handbook.pptx');

function svgData(name, color = C.white) {
  const def = fa[name] || fa.faCircle;
  const svg = icon(def).html.join('')
    .replace(/currentColor/g, `#${color}`)
    .replace(/style="[^"]*"/g, '');
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function addIcon(slide, name, x, y, w, color = C.white) {
  slide.addImage({ data: svgData(name, color), x, y, w, h: w });
}

function addText(slide, text, x, y, w, h, options = {}) {
  slide.addText(text, {
    x, y, w, h, fontFace: options.fontFace || 'Aptos', fontSize: options.fontSize || 12,
    color: options.color || C.ink, bold: options.bold || false, margin: options.margin ?? 0,
    valign: options.valign || 'mid', align: options.align || 'left', breakLine: false,
    fit: 'shrink', paraSpaceAfterPt: options.paraSpaceAfterPt || 0,
    bullet: options.bullet, isTextBox: true, ...options
  });
}

function addTitle(slide, title, subtitle, section = 'OVERVIEW') {
  addText(slide, section.toUpperCase(), 0.58, 0.34, 2.6, 0.23, { fontSize: 8, bold: true, color: C.purple, charSpacing: 1.6 });
  addText(slide, title, 0.58, 0.63, 11.95, 0.52, { fontSize: 26, bold: true, color: C.navy });
  if (subtitle) addText(slide, subtitle, 0.58, 1.18, 11.8, 0.38, { fontSize: 11.5, color: C.muted });
}

function rounded(slide, x, y, w, h, fill, radius = 0.12, line = fill) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: radius, fill: { color: fill }, line: { color: line, width: 1 } });
}

function pill(slide, text, x, y, w, fill, color = C.white) {
  rounded(slide, x, y, w, 0.31, fill, 0.15, fill);
  addText(slide, text, x + 0.08, y + 0.02, w - 0.16, 0.25, { fontSize: 8, bold: true, color, align: 'center' });
}

function iconBadge(slide, name, x, y, fill = C.purple, size = 0.48) {
  slide.addShape(pptx.ShapeType.ellipse, { x, y, w: size, h: size, fill: { color: fill }, line: { color: fill } });
  addIcon(slide, name, x + size * 0.26, y + size * 0.26, size * 0.48, C.white);
}

function card(slide, { x, y, w, h, title, body, iconName, accent = C.purple, tag, value }) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.12, fill: { color: C.white }, line: { color: C.border, width: 1 },
    shadow: { type: 'outer', color: '64748B', opacity: 0.13, blur: 1.5, angle: 45, distance: 0.8 }
  });
  slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.07, h, fill: { color: accent }, line: { color: accent } });
  if (iconName) iconBadge(slide, iconName, x + 0.25, y + 0.23, accent, 0.48);
  const titleX = iconName ? x + 0.87 : x + 0.28;
  if (tag) pill(slide, tag, x + w - 1.22, y + 0.22, 0.94, C.palePurple, C.purple);
  if (value) addText(slide, value, x + 0.25, y + 0.62, w - 0.5, 0.42, { fontSize: 23, bold: true, color: accent });
  addText(slide, title, titleX, y + 0.23, w - (titleX - x) - 0.25, 0.34, { fontSize: 13, bold: true, color: C.navy });
  if (body) addText(slide, body, x + 0.27, y + (value ? 1.12 : 0.76), w - 0.54, h - (value ? 1.28 : 0.92), { fontSize: 10.2, color: C.slate, valign: 'top', breakLine: true, margin: 0.02 });
}

function bulletList(slide, items, x, y, w, h, color = C.ink, fontSize = 11, accent = C.purple) {
  const rowH = h / items.length;
  items.forEach((item, i) => {
    slide.addShape(pptx.ShapeType.ellipse, { x, y: y + i * rowH + 0.1, w: 0.16, h: 0.16, fill: { color: accent }, line: { color: accent } });
    addText(slide, item, x + 0.29, y + i * rowH, w - 0.29, rowH, { fontSize, color, valign: 'top', margin: 0.01 });
  });
}

function stepFlow(slide, steps, x, y, w, h, colors = [C.blue, C.indigo, C.purple, C.violet]) {
  const gap = 0.15;
  const sw = (w - gap * (steps.length - 1)) / steps.length;
  steps.forEach((s, i) => {
    const sx = x + i * (sw + gap);
    rounded(slide, sx, y, sw, h, C.white, 0.12, C.border);
    slide.addShape(pptx.ShapeType.rect, { x: sx, y, w: sw, h: 0.08, fill: { color: colors[i % colors.length] }, line: { color: colors[i % colors.length] } });
    iconBadge(slide, s.icon || 'faCircleCheck', sx + 0.22, y + 0.24, colors[i % colors.length], 0.44);
    addText(slide, String(i + 1).padStart(2, '0'), sx + sw - 0.54, y + 0.26, 0.32, 0.2, { fontSize: 8, bold: true, color: C.muted, align: 'right' });
    addText(slide, s.title, sx + 0.22, y + 0.8, sw - 0.44, 0.52, { fontSize: 12.1, bold: true, color: C.navy, valign: 'top' });
    addText(slide, s.body, sx + 0.22, y + 1.37, sw - 0.44, h - 1.59, { fontSize: 9.2, color: C.slate, valign: 'top' });
    if (i < steps.length - 1) {
      addIcon(slide, 'faChevronRight', sx + sw + 0.035, y + h / 2 - 0.09, 0.18, C.violet);
    }
  });
}

function statusChip(slide, text, x, y, type = 'blue', w = 1.16) {
  const map = {
    blue: [C.paleBlue, C.blue], purple: [C.palePurple, C.purple], green: [C.greenPale, C.green],
    amber: [C.amberPale, C.amber], red: [C.redPale, C.red], grey: ['E2E8F0', C.slate]
  };
  const [fill, color] = map[type];
  pill(slide, text, x, y, w, fill, color);
}

function addNotes(slide, text) {
  if (slide.addNotes) slide.addNotes(text);
}

function connector(slide, x1, y1, x2, y2, line = {}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  slide.addShape(pptx.ShapeType.line, {
    x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(dx), h: Math.abs(dy),
    flipV: dx * dy < 0,
    line: { color: 'A5B4FC', width: 1.4, ...line }
  });
}

function networkArt(slide, x, y, scale = 1) {
  const nodes = [
    [0.2, 1.38, 0.68, C.blue, 'faDatabase'], [1.62, 0.25, 0.82, C.purple, 'faLink'],
    [3.3, 1.18, 0.96, C.indigo, 'faSitemap'], [1.77, 2.35, 1.08, C.violet, 'faCalculator'],
    [3.86, 3.04, 0.76, C.cyan, 'faScaleBalanced'], [0.12, 3.2, 0.72, C.blue2, 'faUserShield']
  ];
  const edges = [[0,1],[1,2],[0,3],[1,3],[2,3],[2,4],[3,4],[0,5],[3,5]];
  edges.forEach(([a,b]) => {
    const n1 = nodes[a], n2 = nodes[b];
    connector(
      slide,
      x + (n1[0] + n1[2] / 2) * scale,
      y + (n1[1] + n1[2] / 2) * scale,
      x + (n2[0] + n2[2] / 2) * scale,
      y + (n2[1] + n2[2] / 2) * scale,
      { color: 'A5B4FC', transparency: 30, width: 1.4, beginArrowType: 'none', endArrowType: 'none' }
    );
  });
  nodes.forEach((n) => {
    slide.addShape(pptx.ShapeType.ellipse, { x: x + n[0] * scale, y: y + n[1] * scale, w: n[2] * scale, h: n[2] * scale, fill: { color: n[3] }, line: { color: C.white, transparency: 20, width: 1.4 }, shadow: { type: 'outer', color: '000000', opacity: 0.18, blur: 2, angle: 45, distance: 1 } });
    addIcon(slide, n[4], x + (n[0] + n[2] * 0.28) * scale, y + (n[1] + n[2] * 0.28) * scale, n[2] * 0.44 * scale, C.white);
  });
}

function metricTile(slide, x, y, w, h, value, label, accent, iconName) {
  rounded(slide, x, y, w, h, '101A33', 0.14, '293759');
  iconBadge(slide, iconName, x + 0.24, y + 0.22, accent, 0.46);
  addText(slide, value, x + 0.86, y + 0.2, w - 1.1, 0.48, { fontSize: 22, bold: true, color: C.white, align: 'right' });
  addText(slide, label, x + 0.24, y + 0.92, w - 0.48, Math.max(0.28, h - 1.12), { fontSize: 9.2, color: 'BFD0F5', valign: 'top' });
}

function sectionSlide(number, title, subtitle, iconName) {
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.ellipse, { x: 8.7, y: -1.15, w: 5.8, h: 5.8, fill: { color: C.purple, transparency: 20 }, line: { color: C.purple, transparency: 100 } });
  s.addShape(pptx.ShapeType.ellipse, { x: 9.8, y: 3.3, w: 4.2, h: 4.2, fill: { color: C.blue, transparency: 25 }, line: { color: C.blue, transparency: 100 } });
  pill(s, `SECTION ${number}`, 0.75, 0.72, 1.3, C.violet, C.white);
  addText(s, title, 0.75, 2.25, 7.5, 1.2, { fontSize: 36, bold: true, color: C.white, valign: 'top' });
  addText(s, subtitle, 0.78, 3.68, 7.25, 0.75, { fontSize: 15, color: 'D7E3FF', valign: 'top' });
  networkArt(s, 8.46, 1.28, 0.78);
  s.addShape(pptx.ShapeType.ellipse, { x: 10.04, y: 2.6, w: 1.32, h: 1.32, fill: { color: C.white, transparency: 4 }, line: { color: C.white, transparency: 100 } });
  addIcon(s, iconName, 10.41, 2.97, 0.58, C.purple);
  addText(s, 'RMC BUSINESS DECK & USER HANDBOOK', 0.78, 6.82, 5.4, 0.2, { fontSize: 8, bold: true, color: 'A5B4FC', charSpacing: 1.4 });
  return s;
}

// 1 — Cover
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.ellipse, { x: 8.25, y: -1.7, w: 6.8, h: 6.8, fill: { color: C.purple, transparency: 12 }, line: { color: C.purple, transparency: 100 } });
  s.addShape(pptx.ShapeType.ellipse, { x: 9.5, y: 3.5, w: 5.2, h: 5.2, fill: { color: C.blue, transparency: 18 }, line: { color: C.blue, transparency: 100 } });
  pill(s, 'BUSINESS DECK + USER HANDBOOK', 0.72, 0.67, 2.72, C.violet, C.white);
  addText(s, 'Raw Material\nContent Management', 0.72, 1.63, 7.35, 1.65, { fontSize: 37, bold: true, color: C.white, valign: 'top', breakLine: true });
  addText(s, 'From raw-material structure and price change to approval, calculation, handoff and reconciliation — in one governed, explainable workflow.', 0.76, 3.58, 6.95, 1.05, { fontSize: 16, color: 'D7E3FF', valign: 'top' });
  pill(s, 'Synthetic trial demo', 0.76, 5.22, 1.62, C.blue, C.white);
  pill(s, 'SAP CAP + SAPUI5', 2.55, 5.22, 1.65, C.purple, C.white);
  pill(s, 'Clean-core ready design', 4.38, 5.22, 1.95, C.indigo, C.white);
  networkArt(s, 8.18, 1.36, 0.92);
  pill(s, 'CONNECTED • EXPLAINABLE • GOVERNED', 8.05, 5.48, 4.22, C.white, C.purple);
  addText(s, 'Application overview • Process guide • Role-based operating handbook', 0.76, 6.57, 7.4, 0.34, { fontSize: 10, color: 'A5B4FC' });
  addNotes(s, 'Use this deck both as an executive introduction and as a practical operating handbook. All demo values are synthetic.');
}

// 2 — Executive highlights
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'The application in one minute', 'A purpose-built control tower for governed raw-material content and retrospective price change.', 'Executive story');
  const highlights = [
    ['faRoute', 'One connected journey', 'Master data, linkages, BOM content, price change, approval, calculation and handoff stay connected.', C.blue],
    ['faCalculator', 'Explainable by design', 'Every cost movement shows its quantity, old/new price, price unit, formula and resulting impact.', C.purple],
    ['faShieldHalved', 'Controls built in', 'Versioning, maker-checker approval, read-only governed data, scope checks and immutable evidence.', C.indigo],
    ['faMagnifyingGlassChart', 'Decision-ready visibility', 'Impacted parts, exceptions, workflow status, proposal value and reconciliation appear in one workbench.', C.cyan]
  ];
  highlights.forEach((h, i) => card(s, { x: 0.62 + (i % 2) * 6.18, y: 1.8 + Math.floor(i / 2) * 2.18, w: 5.82, h: 1.82, iconName: h[0], title: h[1], body: h[2], accent: h[3] }));
  rounded(s, 0.62, 6.28, 12.0, 0.56, C.navy, 0.12, C.navy);
  addIcon(s, 'faCircleCheck', 0.9, 6.43, 0.24, C.white);
  addText(s, 'Trial scope is complete for the confirmed personas; production S/4 connectivity intentionally waits for Gate T3 approval.', 1.3, 6.36, 10.9, 0.35, { fontSize: 10.5, bold: true, color: C.white });
}

// 3 — Purpose
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Purpose: turn fragmented pricing work into a controlled business process', 'The application improves speed and confidence without becoming a shadow ERP.', 'Executive story');
  card(s, { x: 0.62, y: 1.78, w: 3.75, h: 4.78, iconName: 'faTriangleExclamation', title: 'Today’s business challenge', accent: C.amber, body: '' });
  bulletList(s, ['Raw-material content and commercial context can sit in separate tools.', 'Retroactive price changes require manual impact reconstruction.', 'Exceptions and approvals can become email or spreadsheet side processes.', 'Posting and contract-price outcomes need stronger traceability.'], 0.94, 2.75, 3.02, 3.18, C.slate, 10.4, C.amber);
  card(s, { x: 4.58, y: 1.78, w: 3.75, h: 4.78, iconName: 'faWandMagicSparkles', title: 'RMC application response', accent: C.purple, body: '' });
  bulletList(s, ['One canonical view of supplier, material, contract, BOM and RM content.', 'Server-owned, exact-decimal calculations with human-readable traces.', 'Role-based workflows for changes, findings, approvals and corrective action.', 'Controlled proposal, simulation, reversal, rerun and reconciliation evidence.'], 4.9, 2.75, 3.02, 3.18, C.slate, 10.4, C.purple);
  card(s, { x: 8.54, y: 1.78, w: 4.08, h: 4.78, iconName: 'faBullseye', title: 'Business outcome', accent: C.blue, body: '' });
  bulletList(s, ['Faster review of price impact and affected parts.', 'Fewer incomplete or invalid changes entering approval.', 'Clear accountability across Buyer, Admin and Approver personas.', 'Audit-ready evidence for every decision and simulated downstream outcome.'], 8.86, 2.75, 3.36, 3.18, C.slate, 10.4, C.blue);
}

// 4 — Feature universe
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Complete capability map', 'What business users can do in the current trial application.', 'Executive story');
  const caps = [
    ['faDatabase', 'Governed master data', 'Commodity, RM type, grade and subgrade'],
    ['faLink', 'Commercial linkage', 'Supplier, part, plant and valid contract'],
    ['faSitemap', 'BOM hierarchy', 'Recursive explosion, lineage and leaf mapping'],
    ['faLayerGroup', 'Composition', 'Revision, completeness, submit and approve'],
    ['faTags', 'RM pricing', 'Effective price change and impacted parts'],
    ['faCalculator', 'Pricing workbench', 'Cost sheet, delta, impact and trace'],
    ['faFileContract', 'Price document', 'Simulation/amendment release and approval'],
    ['faTriangleExclamation', 'Exception handling', 'Resolve, exclude, reject and rework'],
    ['faScaleBalanced', 'Reconciliation', 'Expected versus actual proposal evidence'],
    ['faRotate', 'Recovery controls', 'Idempotent reversal and lineage-linked rerun'],
    ['faUserShield', 'Authorization', 'Persona gates and organizational scope'],
    ['faClockRotateLeft', 'Auditability', 'Versions, decisions, events and immutable history']
  ];
  caps.forEach((c, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    card(s, { x: 0.6 + col * 3.05, y: 1.68 + row * 1.68, w: 2.82, h: 1.46, iconName: c[0], title: c[1], body: c[2], accent: [C.blue, C.purple, C.indigo, C.cyan][col] });
  });
}

// 5 — E2E process
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'End-to-end process flow', 'Seven stages connect foundation data to an approved, reconciled commercial outcome.', 'Executive story');
  const stages = [
    ['01', 'Prepare', 'Maintain governed RM masters and commodity validity.', 'faDatabase'],
    ['02', 'Connect', 'Link supplier, part, plant and contract — or raise an exception.', 'faLink'],
    ['03', 'Compose', 'Explode BOM, map leaf items and approve a complete revision.', 'faSitemap'],
    ['04', 'Price', 'Submit and approve an effective-dated RM price change.', 'faTags'],
    ['05', 'Assess', 'Review impacted parts, cost sheet, delta and retrospective impact.', 'faCalculator'],
    ['06', 'Approve', 'Release the price document and complete maker-checker decision.', 'faStamp'],
    ['07', 'Reconcile', 'Handoff the proposal and prove expected equals actual.', 'faScaleBalanced']
  ];
  stages.forEach((st, i) => {
    const x = 0.57 + i * 1.78;
    const accent = [C.blue, '3B5CCC', C.indigo, C.purple, C.violet, '7C3AED', C.cyan][i];
    rounded(s, x, 2.0, 1.55, 3.68, C.white, 0.13, C.border);
    rounded(s, x, 2.0, 1.55, 0.72, accent, 0.13, accent);
    addIcon(s, st[3], x + 0.56, 2.19, 0.38, C.white);
    addText(s, st[0], x + 0.2, 2.95, 1.15, 0.25, { fontSize: 8.5, bold: true, color: accent, align: 'center' });
    addText(s, st[1], x + 0.13, 3.27, 1.29, 0.46, { fontSize: 14, bold: true, color: C.navy, align: 'center' });
    addText(s, st[2], x + 0.17, 3.9, 1.21, 1.34, { fontSize: 9, color: C.slate, align: 'center', valign: 'top' });
    if (i < 6) addIcon(s, 'faChevronRight', x + 1.58, 3.62, 0.16, C.violet);
  });
  rounded(s, 1.08, 6.04, 11.02, 0.63, C.pale, 0.12, C.pale);
  addText(s, 'Control loop', 1.34, 6.19, 1.0, 0.24, { fontSize: 9, bold: true, color: C.purple });
  addText(s, 'Findings, rejection, corrective rework, reversal, rerun and audit evidence are available throughout the journey.', 2.34, 6.16, 9.42, 0.3, { fontSize: 10.1, color: C.slate });
}

// 6 — Personas
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Four personas, clear ownership', 'The workflow separates creation, stewardship and approval responsibilities.', 'Executive story');
  const people = [
    ['faUserGear', 'Commodity Admin', C.blue, ['Creates acceptable commodities', 'Closes validity', 'Applies/clears deletion marker']],
    ['faUserPen', 'Buyer', C.purple, ['Requests RM masters', 'Creates linkages and contract exceptions', 'Maps BOM leaf content and submits revisions']],
    ['faUserShield', 'RM Admin', C.indigo, ['Validates parent hierarchy', 'Approves RM master requests', 'Activates type/grade/subgrade codes']],
    ['faUserCheck', 'Approver', C.cyan, ['Decides exceptions and compositions', 'Approves amendment price documents', 'Retains comments and decision evidence']]
  ];
  people.forEach((p, i) => {
    const x = 0.62 + i * 3.03;
    rounded(s, x, 1.78, 2.77, 4.64, C.white, 0.16, C.border);
    rounded(s, x, 1.78, 2.77, 1.15, p[2], 0.16, p[2]);
    addIcon(s, p[0], x + 1.03, 2.04, 0.7, C.white);
    addText(s, p[1], x + 0.23, 3.2, 2.31, 0.55, { fontSize: 16, bold: true, color: C.navy, align: 'center' });
    bulletList(s, p[3], x + 0.28, 4.03, 2.2, 1.78, C.slate, 9.4, p[2]);
  });
  addText(s, 'Production adds organizational scope by company code, purchasing organization, plant and supplier group.', 0.76, 6.67, 11.76, 0.28, { fontSize: 9.5, bold: true, color: C.purple, align: 'center' });
}

// Persona-to-capability matrix
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Who does what: persona-to-capability map', 'A compact operating model for training, role design and stakeholder alignment.', 'Executive story');
  const rows = ['Commodity lifecycle', 'RM master activation', 'Vendor-part linkage', 'Contract exception', 'BOM leaf mapping', 'Composition approval', 'Price-document decision'];
  const cols = [
    ['Commodity Admin', C.blue], ['Buyer', C.purple], ['RM Admin', C.indigo], ['Approver', C.cyan]
  ];
  rounded(s, 0.62, 1.75, 12.0, 4.96, C.white, 0.14, C.border);
  addText(s, 'CAPABILITY', 0.92, 2.08, 2.65, 0.28, { fontSize: 9, bold: true, color: C.muted, charSpacing: 0.7 });
  cols.forEach((c, i) => {
    rounded(s, 3.62 + i * 2.11, 1.98, 1.83, 0.62, c[1], 0.08, c[1]);
    addText(s, c[0], 3.7 + i * 2.11, 2.15, 1.67, 0.26, { fontSize: 8.5, bold: true, color: C.white, align: 'center' });
  });
  const ownership = [[0], [1,2], [1], [1,3], [1], [1,3], [3]];
  rows.forEach((r, ri) => {
    const y = 2.78 + ri * 0.51;
    if (ri % 2 === 0) rounded(s, 0.84, y - 0.06, 11.54, 0.43, C.light, 0.04, C.light);
    addText(s, r, 0.96, y, 2.48, 0.26, { fontSize: 9.1, bold: true, color: C.slate });
    cols.forEach((c, ci) => {
      const active = ownership[ri].includes(ci);
      if (active) {
        iconBadge(s, 'faCheck', 4.28 + ci * 2.11, y - 0.04, c[1], 0.31);
      } else {
        addText(s, '—', 4.25 + ci * 2.11, y - 0.02, 0.37, 0.25, { fontSize: 10, color: 'CBD5E1', align: 'center' });
      }
    });
  });
  rounded(s, 0.84, 6.39, 11.54, 0.22, C.palePurple, 0.06, C.palePurple);
  addText(s, 'All approval decisions retain actor, role, object version, timestamp and comment evidence.', 1.05, 6.39, 11.12, 0.2, { fontSize: 8.4, bold: true, color: C.purple, align: 'center' });
}

// 7 — Value
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Why business teams will value it', 'RMC converts control requirements into a faster, more transparent working experience.', 'Executive story');
  const vals = [
    ['faBolt', 'Faster cycle time', 'Guided actions and complete context reduce handoffs and repeated clarification.', C.blue],
    ['faCircleCheck', 'Better first-time quality', 'Validity, hierarchy, completeness and contract checks stop preventable defects early.', C.green],
    ['faChartLine', 'Clear commercial impact', 'Users see affected parts, current/proposed value and retrospective exposure before action.', C.purple],
    ['faShieldHalved', 'Stronger control posture', 'Maker-checker separation, immutable approved versions and replay-safe downstream actions.', C.indigo],
    ['faMagnifyingGlass', 'Explainability', 'Every result can be traced to the exact quantity, price, factor, unit and business decision.', C.cyan],
    ['faPlugCircleCheck', 'Clean-core path', 'Replaceable adapters protect the workflow while productive S/4 interfaces are verified later.', C.violet]
  ];
  vals.forEach((v, i) => card(s, { x: 0.62 + (i % 3) * 4.06, y: 1.78 + Math.floor(i / 3) * 2.28, w: 3.78, h: 1.94, iconName: v[0], title: v[1], body: v[2], accent: v[3] }));
  rounded(s, 0.62, 6.44, 12.0, 0.42, C.navy, 0.1, C.navy);
  addText(s, 'SELLING MESSAGE  •  Purpose-built visibility + governed execution + clean-core transition readiness', 0.88, 6.5, 11.48, 0.23, { fontSize: 9, bold: true, color: C.white, align: 'center', charSpacing: 0.5 });
}

// 8 — Control tower
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'A role-aware control tower — not a collection of disconnected screens', 'The homepage directs attention to work, risk and value.', 'Executive story');
  rounded(s, 0.62, 1.72, 12.0, 4.98, 'F0F3FA', 0.16, C.border);
  rounded(s, 0.85, 1.96, 11.54, 0.74, C.navy, 0.13, C.navy);
  addText(s, 'RMC CONTROL TOWER', 1.12, 2.13, 3.1, 0.25, { fontSize: 12, bold: true, color: C.white });
  statusChip(s, 'DEMO MODE', 10.82, 2.15, 'purple', 1.25);
  const metrics = [['Open work', '07', C.blue], ['Findings', '02', C.amber], ['Impacted parts', '03', C.purple], ['Reconciled', 'INR 2,265', C.green]];
  metrics.forEach((m, i) => {
    rounded(s, 0.94 + i * 2.86, 2.98, 2.58, 1.2, C.white, 0.12, C.border);
    addText(s, m[0], 1.17 + i * 2.86, 3.18, 2.12, 0.23, { fontSize: 8.5, bold: true, color: C.muted });
    addText(s, m[1], 1.17 + i * 2.86, 3.48, 2.12, 0.42, { fontSize: 19, bold: true, color: m[2] });
  });
  rounded(s, 0.94, 4.46, 7.2, 1.76, C.white, 0.12, C.border);
  addText(s, 'Journey status', 1.18, 4.69, 2.0, 0.28, { fontSize: 11, bold: true, color: C.navy });
  ['Master data', 'Linkage', 'Composition', 'Pricing', 'Approval'].forEach((t, i) => {
    statusChip(s, t, 1.18 + i * 1.32, 5.24, i < 3 ? 'green' : (i === 3 ? 'purple' : 'amber'), 1.12);
  });
  rounded(s, 8.36, 4.46, 3.8, 1.76, C.white, 0.12, C.border);
  addText(s, 'Attention needed', 8.62, 4.69, 2.3, 0.28, { fontSize: 11, bold: true, color: C.navy });
  addText(s, '• 1 amendment awaiting approval\n• 1 advisory finding documented', 8.62, 5.14, 3.05, 0.75, { fontSize: 9.6, color: C.slate, valign: 'top', breakLine: true });
}

// Verified data story
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  addText(s, 'VERIFIED TRIAL SNAPSHOT', 0.72, 0.58, 3.1, 0.25, { fontSize: 9, bold: true, color: 'A5B4FC', charSpacing: 1.5 });
  addText(s, 'A complete business journey,\nbacked by concrete evidence', 0.72, 1.03, 7.45, 1.1, { fontSize: 31, bold: true, color: C.white, valign: 'top', breakLine: true });
  addText(s, 'No vanity metrics — only values verified in the current synthetic trial baseline.', 0.75, 2.35, 7.2, 0.42, { fontSize: 13, color: 'BFD0F5' });
  const metrics = [
    ['4', 'confirmed business personas', C.blue, 'faUsers'],
    ['7', 'connected process stages', C.purple, 'faRoute'],
    ['14/14', 'automated tests passing', C.indigo, 'faVialCircleCheck'],
    ['0', 'production vulnerabilities', C.cyan, 'faShieldHalved'],
    ['280', 'eligible synthetic GR units', C.blue2, 'faBoxesStacked'],
    ['INR 4,200', 'verified retrospective impact', C.violet, 'faChartLine']
  ];
  metrics.forEach((m, i) => metricTile(s, 0.72 + (i % 3) * 4.08, 3.05 + Math.floor(i / 3) * 1.86, 3.72, 1.62, m[0], m[1], m[2], m[3]));
  addText(s, 'Synthetic demonstration values • Not a productive financial result', 0.75, 6.96, 11.75, 0.22, { fontSize: 8.3, bold: true, color: '8EA6D7', align: 'center', charSpacing: 0.6 });
}

// Before / after operating model
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'From fragmented coordination to one governed operating model', 'The application consolidates context and controls while S/4 remains the future authoritative boundary.', 'Executive story');
  rounded(s, 0.62, 1.78, 5.45, 4.76, 'FFF7ED', 0.14, 'FED7AA');
  pill(s, 'BEFORE', 0.94, 2.05, 1.1, C.amber, C.white);
  const before = [
    ['faFileExcel', 'Spreadsheet-based reconstruction'], ['faEnvelope', 'Approval context in email'],
    ['faPuzzlePiece', 'Disconnected BOM and price views'], ['faQuestion', 'Difficult result explanation'],
    ['faCopy', 'Duplicate-action risk'], ['faMagnifyingGlass', 'Manual reconciliation search']
  ];
  before.forEach((b, i) => {
    iconBadge(s, b[0], 0.98, 2.75 + i * 0.56, C.amber, 0.34);
    addText(s, b[1], 1.5, 2.75 + i * 0.56, 3.94, 0.29, { fontSize: 9.5, color: C.slate });
  });
  addIcon(s, 'faArrowRightLong', 6.28, 3.76, 0.72, C.purple);
  rounded(s, 7.17, 1.78, 5.45, 4.76, C.palePurple, 0.14, 'C4B5FD');
  pill(s, 'WITH RMC', 7.49, 2.05, 1.28, C.purple, C.white);
  const after = [
    ['faRoute', 'One connected seven-stage journey'], ['faUserShield', 'Role-based maker-checker workflow'],
    ['faSitemap', 'BOM lineage and leaf mapping'], ['faCalculator', 'Human-readable exact formula trace'],
    ['faFingerprint', 'Idempotent reversal and rerun'], ['faScaleBalanced', 'Expected-versus-actual reconciliation']
  ];
  after.forEach((a, i) => {
    iconBadge(s, a[0], 7.53, 2.75 + i * 0.56, C.purple, 0.34);
    addText(s, a[1], 8.05, 2.75 + i * 0.56, 3.94, 0.29, { fontSize: 9.5, bold: true, color: C.navy });
  });
  rounded(s, 3.5, 6.27, 6.95, 0.44, C.navy, 0.1, C.navy);
  addText(s, 'Outcome: clearer decisions • fewer preventable defects • stronger evidence', 3.72, 6.36, 6.5, 0.22, { fontSize: 8.9, bold: true, color: C.white, align: 'center' });
}

sectionSlide('02', 'User handbook', 'Role-based instructions for every feature available in the trial application.', 'faBookOpen');

// Handbook visual map
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'How to use this handbook', 'Follow the colored route for your persona, or jump directly to the task you need.', 'User handbook');
  const lanes = [
    [C.blue, 'Commodity Admin', ['Commodity lifecycle']],
    [C.purple, 'Buyer', ['RM request', 'Linkage', 'Contract exception', 'BOM', 'Composition', 'Price impact']],
    [C.indigo, 'RM Admin', ['RM activation']],
    [C.cyan, 'Approver', ['Exception decision', 'Composition decision', 'Price-document decision']]
  ];
  lanes.forEach((l, li) => {
    const y = 1.82 + li * 1.13;
    addText(s, l[1], 0.7, y + 0.16, 1.65, 0.28, { fontSize: 10, bold: true, color: l[0] });
    s.addShape(pptx.ShapeType.line, { x: 2.38, y: y + 0.31, w: 9.52, h: 0, line: { color: l[0], width: 3.2 } });
    l[2].forEach((task, ti) => {
      const x = 2.65 + ti * Math.min(1.55, 8.4 / Math.max(1, l[2].length - 1));
      s.addShape(pptx.ShapeType.ellipse, { x, y: y + 0.16, w: 0.3, h: 0.3, fill: { color: C.white }, line: { color: l[0], width: 2 } });
      addText(s, task, x - 0.33, y + 0.51, 0.96, 0.38, { fontSize: 7.7, bold: true, color: C.slate, align: 'center', valign: 'top' });
    });
  });
  rounded(s, 0.7, 6.39, 11.82, 0.38, C.pale, 0.08, C.pale);
  addText(s, 'Cross-cutting controls: findings • versioning • audit evidence • reconciliation • reversal • rerun', 0.96, 6.46, 11.31, 0.2, { fontSize: 8.8, bold: true, color: C.purple, align: 'center' });
}

// 10 — Getting started
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Getting started: open, orient and select your task', 'The demo uses synthetic seed data and resets when restarted.', 'User handbook');
  stepFlow(s, [
    { icon: 'faPowerOff', title: 'Start demo', body: 'Run npm.cmd run start:demo from the project folder.' },
    { icon: 'faGlobe', title: 'Open app', body: 'Browse to localhost:4004/rmc/webapp/index.html.' },
    { icon: 'faTriangleExclamation', title: 'Confirm banner', body: 'Check “DEMO — NOT CONNECTED TO S/4HANA”.' },
    { icon: 'faListCheck', title: 'Choose work', body: 'Use the journey navigation and status cards to open the relevant task.' }
  ], 0.62, 1.82, 12.0, 3.42);
  rounded(s, 0.62, 5.55, 12.0, 0.94, C.pale, 0.12, C.pale);
  addIcon(s, 'faCircleInfo', 0.92, 5.82, 0.31, C.purple);
  addText(s, 'Demo reset behavior', 1.42, 5.72, 1.72, 0.28, { fontSize: 10, bold: true, color: C.purple });
  addText(s, 'The in-memory database is disposable. Restarting the demo restores version-controlled synthetic seed data and removes changes made during the prior session.', 3.05, 5.67, 9.1, 0.46, { fontSize: 10, color: C.slate });
}

// 11 — Navigation anatomy
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'How to read every screen', 'A consistent pattern keeps business context, action and evidence together.', 'User handbook');
  const zones = [
    ['1', 'Context header', 'Supplier, part, plant, contract, validity and status.', C.blue],
    ['2', 'Work area', 'Editable fields or server-owned result tables for the selected task.', C.purple],
    ['3', 'Guided actions', 'Only valid actions appear for the current state and persona.', C.indigo],
    ['4', 'Evidence panel', 'History, findings, formula trace, approval and reconciliation details.', C.cyan]
  ];
  rounded(s, 0.62, 1.78, 7.12, 4.85, 'F0F3FA', 0.16, C.border);
  rounded(s, 0.88, 2.02, 6.6, 0.74, C.navy, 0.11, C.navy);
  addText(s, 'PART RM CONTENT  •  SYN-1000  •  PL01', 1.15, 2.22, 4.9, 0.25, { fontSize: 11, bold: true, color: C.white });
  iconBadge(s, 'faCircleInfo', 6.69, 2.15, C.blue, 0.4);
  rounded(s, 0.88, 2.98, 4.34, 2.85, C.white, 0.11, C.border);
  addText(s, 'WORK AREA', 1.12, 3.18, 2, 0.23, { fontSize: 9, bold: true, color: C.purple });
  for (let i = 0; i < 4; i++) s.addShape(pptx.ShapeType.line, { x: 1.12, y: 3.78 + i * 0.43, w: 3.55, h: 0, line: { color: 'D5DDEA', width: 1 } });
  rounded(s, 5.44, 2.98, 2.04, 2.85, C.white, 0.11, C.border);
  addText(s, 'EVIDENCE', 5.69, 3.18, 1.5, 0.23, { fontSize: 9, bold: true, color: C.cyan });
  statusChip(s, 'APPROVED', 5.68, 3.68, 'green', 1.38);
  pill(s, 'SUBMIT', 1.11, 6.02, 1.18, C.purple, C.white);
  pill(s, 'SAVE DRAFT', 2.45, 6.02, 1.42, C.blue, C.white);
  zones.forEach((z, i) => card(s, { x: 8.02, y: 1.78 + i * 1.21, w: 4.6, h: 1.03, title: `${z[0]}  ${z[1]}`, body: z[2], accent: z[3] }));
}

// 12 — Commodity
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Commodity Admin: maintain the acceptable commodity list', 'Lifecycle actions preserve history — records are never physically deleted.', 'User handbook');
  stepFlow(s, [
    { icon: 'faPlus', title: 'Create', body: 'Enter unique code, description, valid-from and optional valid-to.' },
    { icon: 'faCircleCheck', title: 'Validate', body: 'The service checks dates, duplicates and canonical formatting.' },
    { icon: 'faCalendarXmark', title: 'Close validity', body: 'Shorten valid-to; never extend a prior close through this action.' },
    { icon: 'faBan', title: 'Mark / unmark', body: 'Use a reversible deletion marker. The row and audit trail remain.' }
  ], 0.62, 1.82, 12.0, 3.35, [C.blue, C.purple, C.amber, C.red]);
  card(s, { x: 0.62, y: 5.48, w: 3.78, h: 1.1, iconName: 'faUserGear', title: 'Owner', body: 'Commodity Admin', accent: C.blue });
  card(s, { x: 4.57, y: 5.48, w: 3.78, h: 1.1, iconName: 'faShieldHalved', title: 'Key control', body: 'Optimistic version prevents stale updates.', accent: C.purple });
  card(s, { x: 8.53, y: 5.48, w: 4.09, h: 1.1, iconName: 'faClockRotateLeft', title: 'Evidence', body: 'Every lifecycle action creates an audit record.', accent: C.cyan });
}

// 13 — RM request
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Buyer + RM Admin: request and activate RM hierarchy', 'New type, grade or subgrade codes enter use only after stewardship approval.', 'User handbook');
  stepFlow(s, [
    { icon: 'faUserPen', title: 'Buyer drafts request', body: 'Select level, code, description, parent and business justification.' },
    { icon: 'faPaperPlane', title: 'Buyer submits', body: 'Submission locks the requested version for review.' },
    { icon: 'faUserShield', title: 'RM Admin validates', body: 'Confirm hierarchy, uniqueness, parent status and effective dates.' },
    { icon: 'faCircleCheck', title: 'Approve / reject', body: 'Approval activates the code; rejection records corrective guidance.' }
  ], 0.62, 1.82, 12.0, 3.42);
  rounded(s, 0.62, 5.58, 12.0, 0.95, C.white, 0.12, C.border);
  addText(s, 'State path', 0.92, 5.78, 1.0, 0.28, { fontSize: 10, bold: true, color: C.navy });
  statusChip(s, 'DRAFT', 2.0, 5.77, 'grey', 1.02); addIcon(s, 'faArrowRight', 3.14, 5.84, 0.14, C.muted);
  statusChip(s, 'SUBMITTED', 3.39, 5.77, 'blue', 1.3); addIcon(s, 'faArrowRight', 4.83, 5.84, 0.14, C.muted);
  statusChip(s, 'APPROVED', 5.08, 5.77, 'green', 1.24); addText(s, 'or', 6.49, 5.78, 0.28, 0.26, { fontSize: 9, color: C.muted, align: 'center' });
  statusChip(s, 'REJECTED', 6.94, 5.77, 'red', 1.2);
  addText(s, 'Activated codes become selectable in composition and price workflows.', 8.38, 5.73, 3.78, 0.39, { fontSize: 9.5, color: C.slate });
}

// 14 linkage
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Buyer: create supplier–part linkage and find a valid contract', 'Contract search validates the commercial context on the selected business date.', 'User handbook');
  const fields = [['Supplier', 'SYN-V001'], ['Material', 'SYN-1000'], ['Plant', 'PL01'], ['Business date', 'Selected date'], ['Contract', 'Valid released item']];
  rounded(s, 0.62, 1.77, 5.08, 4.9, C.white, 0.14, C.border);
  addText(s, 'Linkage form', 0.94, 2.05, 2.2, 0.35, { fontSize: 15, bold: true, color: C.navy });
  fields.forEach((f, i) => {
    addText(s, f[0], 0.96, 2.7 + i * 0.63, 1.3, 0.22, { fontSize: 8.5, bold: true, color: C.muted });
    rounded(s, 2.28, 2.61 + i * 0.63, 2.98, 0.43, C.light, 0.06, C.border);
    addText(s, f[1], 2.46, 2.69 + i * 0.63, 2.62, 0.23, { fontSize: 9.5, color: C.slate });
  });
  pill(s, 'SEARCH VALID CONTRACTS', 2.89, 5.94, 2.37, C.purple, C.white);
  rounded(s, 5.96, 1.77, 6.66, 4.9, C.white, 0.14, C.border);
  addText(s, 'Search validation', 6.29, 2.05, 2.5, 0.35, { fontSize: 15, bold: true, color: C.navy });
  bulletList(s, ['Supplier and material match', 'Plant and purchasing scope match', 'Header/item validity includes business date', 'Contract/item is released and not blocked', 'Currency and price-unit context is retained'], 6.3, 2.63, 5.65, 2.84, C.slate, 10.2, C.blue);
  statusChip(s, 'VALID MATCH', 6.33, 5.93, 'green', 1.52);
  addText(s, 'Select the result to create an ALLOCATED linkage.', 8.06, 5.89, 3.85, 0.37, { fontSize: 9.6, color: C.slate });
}

// 15 exception
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'No contract? Use a governed exception — then allocate later', 'The process can continue without losing accountability or exception history.', 'User handbook');
  stepFlow(s, [
    { icon: 'faMagnifyingGlass', title: 'No valid match', body: 'Contract search returns no eligible released item.' },
    { icon: 'faTriangleExclamation', title: 'Create exception', body: 'Buyer records the mandatory business reason and linkage context.' },
    { icon: 'faUserCheck', title: 'Approver decision', body: 'Approve to proceed conditionally or reject for corrective rework.' },
    { icon: 'faLink', title: 'Allocate later', body: 'When a contract becomes valid, Buyer allocates it without deleting history.' }
  ], 0.62, 1.82, 12.0, 3.42, [C.amber, C.purple, C.indigo, C.green]);
  rounded(s, 0.62, 5.56, 12.0, 0.96, C.amberPale, 0.12, C.amberPale);
  addIcon(s, 'faShieldHalved', 0.92, 5.84, 0.29, C.amber);
  addText(s, 'Control rule', 1.38, 5.69, 1.25, 0.25, { fontSize: 9.5, bold: true, color: C.amber });
  addText(s, 'A missing-contract linkage creates a mandatory finding. Composition cannot be approved until the exception is formally accepted or resolved.', 2.62, 5.66, 9.42, 0.44, { fontSize: 10, color: C.slate });
}

// 16 BOM
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Buyer: explore the BOM hierarchy and map only leaf components', 'The hierarchy retains depth and lineage so each RM mapping is explainable.', 'User handbook');
  rounded(s, 0.62, 1.78, 6.2, 4.9, C.white, 0.14, C.border);
  addText(s, 'BOM tree', 0.94, 2.05, 2, 0.34, { fontSize: 15, bold: true, color: C.navy });
  const tree = [
    [0, 'SYN-1000  Finished part', false], [1, 'SUB-1100  Sub-assembly', false],
    [2, 'RM-STEEL  Steel leaf', true], [2, 'RM-ALLOY  Alloy leaf', true], [1, 'RM-RESIN  Resin leaf', true]
  ];
  tree.forEach((r, i) => {
    const y = 2.67 + i * 0.62;
    if (r[0] > 0) s.addShape(pptx.ShapeType.line, { x: 1.23 + (r[0] - 1) * 0.42, y: y - 0.3, w: 0, h: 0.58, line: { color: 'B8C2D5', width: 1.2 } });
    if (r[0] > 0) s.addShape(pptx.ShapeType.line, { x: 1.23 + (r[0] - 1) * 0.42, y, w: 0.33, h: 0, line: { color: 'B8C2D5', width: 1.2 } });
    iconBadge(s, r[2] ? 'faLeaf' : 'faCubes', 1.06 + r[0] * 0.42, y - 0.2, r[2] ? C.green : C.purple, 0.38);
    addText(s, r[1], 1.58 + r[0] * 0.42, y - 0.17, 4.45 - r[0] * 0.42, 0.33, { fontSize: 9.8, bold: !r[2], color: C.slate });
  });
  rounded(s, 7.08, 1.78, 5.54, 4.9, C.white, 0.14, C.border);
  addText(s, 'Mapping rules', 7.4, 2.05, 2.2, 0.34, { fontSize: 15, bold: true, color: C.navy });
  bulletList(s, ['Select the effective BOM header and key date.', 'Expand recursively; cycle and depth protection is automatic.', 'Use lineage/path to understand where each component originates.', 'Map RM type, grade, subgrade and normalized quantity only on leaf rows.', 'Assemblies cannot receive direct RM mapping.'], 7.42, 2.64, 4.72, 3.14, C.slate, 10.1, C.purple);
  statusChip(s, 'LEAF = MAPPABLE', 9.93, 5.96, 'green', 1.81);
}

// 17 composition
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Create, validate and approve a revisioned composition', 'Approved content is immutable; corrections create a new version.', 'User handbook');
  const states = [
    ['DRAFT', 'Buyer maps leaf items, weights and RM hierarchy.', 'grey'],
    ['IN REVIEW', 'Submission recalculates completeness and findings.', 'blue'],
    ['APPROVED', 'Approver locks the accepted composition version.', 'green'],
    ['SUPERSEDED', 'A later approved revision becomes controlling.', 'purple']
  ];
  states.forEach((st, i) => {
    const x = 0.72 + i * 3.02;
    rounded(s, x, 2.06, 2.66, 2.28, C.white, 0.13, C.border);
    statusChip(s, st[0], x + 0.27, 2.34, st[2], 1.25);
    addText(s, `REVISION ${i + 1}`, x + 1.57, 2.39, 0.8, 0.2, { fontSize: 7.5, bold: true, color: C.muted, align: 'right' });
    addText(s, st[1], x + 0.27, 3.0, 2.12, 0.8, { fontSize: 9.8, color: C.slate, valign: 'top' });
    if (i < 3) addIcon(s, 'faChevronRight', x + 2.75, 3.02, 0.17, C.violet);
  });
  card(s, { x: 0.72, y: 4.74, w: 3.74, h: 1.42, iconName: 'faListCheck', title: 'Submission gate', body: 'All mandatory leaf mappings complete; weights and units valid; no blocking findings.', accent: C.blue });
  card(s, { x: 4.78, y: 4.74, w: 3.74, h: 1.42, iconName: 'faUserCheck', title: 'Approval gate', body: 'Approver decides the exact submitted version and records comment/evidence.', accent: C.purple });
  card(s, { x: 8.84, y: 4.74, w: 3.74, h: 1.42, iconName: 'faLock', title: 'After approval', body: 'No in-place edit. Start a new revision for any correction or business change.', accent: C.indigo });
}

// 18 findings
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Workflow findings: resolve blockers and document advisories', 'The application distinguishes what must be fixed from what may be accepted with evidence.', 'User handbook');
  card(s, { x: 0.62, y: 1.8, w: 5.82, h: 2.14, iconName: 'faCircleExclamation', title: 'Mandatory finding', body: 'Blocks submission or approval. Correct the source condition or complete the governed exception decision before proceeding.', accent: C.red, tag: 'BLOCKING' });
  card(s, { x: 6.8, y: 1.8, w: 5.82, h: 2.14, iconName: 'faTriangleExclamation', title: 'Advisory finding', body: 'Does not automatically block. Resolve it, or exclude it with a documented reason that remains visible through approval.', accent: C.amber, tag: 'ADVISORY' });
  stepFlow(s, [
    { icon: 'faMagnifyingGlass', title: 'Review', body: 'Open the finding and inspect object, rule and corrective guidance.' },
    { icon: 'faScrewdriverWrench', title: 'Correct', body: 'Fix the underlying linkage, mapping, data or approval condition.' },
    { icon: 'faBan', title: 'Exclude advisory', body: 'If justified, record reason and change advisory status to EXCLUDED.' },
    { icon: 'faClockRotateLeft', title: 'Retain history', body: 'Resolution/exclusion remains part of the object’s audit evidence.' }
  ], 0.62, 4.25, 12.0, 2.1);
}

// 19 RM price change
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Submit and approve an effective-dated RM price change', 'Grade and subgrade context ensures the correct affected parts and cost components are selected.', 'User handbook');
  rounded(s, 0.62, 1.76, 5.42, 4.88, C.white, 0.14, C.border);
  addText(s, 'Price request', 0.94, 2.04, 2.2, 0.33, { fontSize: 15, bold: true, color: C.navy });
  const pf = [['Supplier', 'SYN-V001'], ['RM grade / subgrade', 'STEEL / SG-A'], ['Current price', 'INR 60 / KG'], ['Proposed price', 'INR 70 / KG'], ['Effective period', 'Approved validity window']];
  pf.forEach((f, i) => {
    addText(s, f[0], 0.96, 2.67 + i * 0.58, 1.55, 0.22, { fontSize: 8.3, bold: true, color: C.muted });
    addText(s, f[1], 2.58, 2.67 + i * 0.58, 2.82, 0.24, { fontSize: 9.7, color: i === 3 ? C.purple : C.slate, bold: i === 3 });
    s.addShape(pptx.ShapeType.line, { x: 0.96, y: 3.03 + i * 0.58, w: 4.35, h: 0, line: { color: C.border, width: 1 } });
  });
  pill(s, 'SUBMIT FOR APPROVAL', 3.19, 5.96, 2.12, C.purple, C.white);
  rounded(s, 6.32, 1.76, 6.3, 4.88, C.white, 0.14, C.border);
  addText(s, 'Approval review', 6.64, 2.04, 2.2, 0.33, { fontSize: 15, bold: true, color: C.navy });
  bulletList(s, ['Compare current and proposed price with unit/currency.', 'Confirm validity fits the approved request period.', 'Review impacted supplier-part compositions.', 'Check calculation preview and evidence.', 'Approve or reject with a business comment.'], 6.65, 2.68, 5.33, 2.84, C.slate, 10.1, C.purple);
  statusChip(s, 'APPROVED', 10.47, 5.94, 'green', 1.27);
}

// 20 workbench
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Pricing Workbench: the decision cockpit', 'Seven visual stages combine commercial context, component detail, impact and workflow evidence.', 'User handbook');
  const blocks = [
    ['Header', 'Supplier, material, plant, contract, dates and status', C.blue],
    ['Cost sheet', 'Current/proposed component values and delta', C.purple],
    ['Impact', 'Eligible quantity × unit delta with exact decimal result', C.indigo],
    ['Workflow', 'Request, approval, release and reconciliation timeline', C.cyan]
  ];
  rounded(s, 0.62, 1.76, 12.0, 4.98, 'F0F3FA', 0.14, C.border);
  rounded(s, 0.9, 2.01, 11.44, 0.72, C.navy, 0.12, C.navy);
  addText(s, 'PRICING WORKBENCH  •  SYN-1000 / SYN-V001 / PL01', 1.17, 2.21, 6.8, 0.25, { fontSize: 11, bold: true, color: C.white });
  statusChip(s, 'APPROVED PRICE', 10.52, 2.21, 'green', 1.51);
  blocks.forEach((b, i) => {
    const x = 0.91 + (i % 2) * 5.83, y = 3.01 + Math.floor(i / 2) * 1.6;
    rounded(s, x, y, 5.55, 1.34, C.white, 0.1, C.border);
    s.addShape(pptx.ShapeType.rect, { x, y, w: 0.08, h: 1.34, fill: { color: b[2] }, line: { color: b[2] } });
    addText(s, b[0], x + 0.28, y + 0.2, 1.35, 0.27, { fontSize: 11.5, bold: true, color: C.navy });
    addText(s, b[1], x + 0.28, y + 0.59, 4.87, 0.48, { fontSize: 9.5, color: C.slate, valign: 'top' });
  });
  addText(s, 'Server results are controlling; the UI does not own financial calculation logic.', 0.88, 6.47, 11.51, 0.22, { fontSize: 8.8, bold: true, color: C.purple, align: 'center' });
}

// 21 formula
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'How the cost and retrospective impact are calculated', 'Users can inspect the exact formula instead of accepting a black-box total.', 'User handbook');
  rounded(s, 0.62, 1.84, 12.0, 1.22, C.navy, 0.14, C.navy);
  addText(s, 'Component delta', 0.96, 2.03, 1.65, 0.28, { fontSize: 10, bold: true, color: 'A5B4FC' });
  addText(s, 'Quantity × (Proposed RM price − Current RM price) ÷ Price unit', 2.55, 1.98, 9.44, 0.42, { fontSize: 20, bold: true, color: C.white, align: 'center' });
  addText(s, 'Retrospective impact = eligible receipt quantity × approved unit delta', 2.55, 2.48, 9.44, 0.26, { fontSize: 10.5, color: 'D7E3FF', align: 'center' });
  const ex = [
    ['RM quantity', '1.5 KG', C.blue], ['Old → new', 'INR 60 → 70', C.purple], ['Price unit', '1', C.indigo], ['Component delta', 'INR 15', C.cyan]
  ];
  ex.forEach((e, i) => card(s, { x: 0.62 + i * 3.03, y: 3.42, w: 2.78, h: 1.56, title: e[0], value: e[1], accent: e[2] }));
  rounded(s, 0.62, 5.36, 12.0, 1.03, C.palePurple, 0.12, C.palePurple);
  addText(s, 'Verified trial evidence', 0.94, 5.56, 1.8, 0.26, { fontSize: 9.5, bold: true, color: C.purple });
  addText(s, '300 receipt units − 20 reversal units = 280 eligible units  •  Retrospective impact = INR 4,200', 2.73, 5.49, 9.24, 0.42, { fontSize: 14, bold: true, color: C.navy, align: 'center' });
}

// Verified financial bridges
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Verified value bridges: from RM delta to commercial proposal', 'Two transparent bridges connect the approved price change to its retrospective and contract effects.', 'User handbook');
  addText(s, 'CONTRACT-PRICE BRIDGE', 0.7, 1.77, 3.0, 0.26, { fontSize: 9, bold: true, color: C.purple, charSpacing: 1.1 });
  const bars = [
    [1.0, 4.65, 2.2, 1.1, C.blue, 'Current', 'INR 2,250'],
    [4.0, 4.05, 2.2, 0.6, C.purple, 'RM delta', '+ INR 15'],
    [7.0, 4.45, 2.2, 1.3, C.indigo, 'Proposed', 'INR 2,265']
  ];
  bars.forEach((b, i) => {
    rounded(s, b[0], b[1], b[2], b[3], b[4], 0.06, b[4]);
    addText(s, b[5], b[0], b[1] - 0.48, b[2], 0.24, { fontSize: 9.2, bold: true, color: C.muted, align: 'center' });
    addText(s, b[6], b[0] + 0.1, b[1] + b[3] / 2 - 0.15, b[2] - 0.2, 0.3, { fontSize: 13, bold: true, color: C.white, align: 'center' });
    if (i < 2) addIcon(s, i === 0 ? 'faPlus' : 'faEquals', b[0] + 2.48, 4.65, 0.24, C.purple);
  });
  s.addShape(pptx.ShapeType.line, { x: 0.82, y: 5.78, w: 8.65, h: 0, line: { color: C.border, width: 1.4 } });
  rounded(s, 9.78, 1.76, 2.84, 4.86, C.navy, 0.16, C.navy);
  addText(s, 'RETROSPECTIVE\nBRIDGE', 10.12, 2.12, 2.16, 0.64, { fontSize: 11, bold: true, color: 'A5B4FC', align: 'center', breakLine: true });
  rounded(s, 10.08, 2.98, 2.24, 1.17, '101A33', 0.12, '293759');
  addText(s, '300 − 20', 10.23, 3.16, 1.94, 0.38, { fontSize: 19, bold: true, color: C.white, align: 'center' });
  addText(s, 'receipt less reversal', 10.23, 3.62, 1.94, 0.23, { fontSize: 8.1, color: 'BFD0F5', align: 'center' });
  addText(s, '=', 10.98, 4.29, 0.42, 0.3, { fontSize: 17, bold: true, color: C.white, align: 'center' });
  addText(s, '280 units', 10.16, 4.65, 2.08, 0.38, { fontSize: 17, bold: true, color: C.white, align: 'center' });
  addText(s, '× INR 15 unit delta', 10.16, 5.08, 2.08, 0.26, { fontSize: 9.2, color: 'BFD0F5', align: 'center' });
  addText(s, 'INR 4,200', 10.06, 5.55, 2.28, 0.46, { fontSize: 20, bold: true, color: '67E8F9', align: 'center' });
  addText(s, 'All values are synthetic and verified in the current trial baseline.', 0.76, 6.49, 8.85, 0.24, { fontSize: 8.5, bold: true, color: C.muted, align: 'center' });
}

// 22 impacted parts
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Review impacted parts before releasing a price document', 'The impact list links each approved RM price to the supplier-part compositions it changes.', 'User handbook');
  rounded(s, 0.62, 1.79, 12.0, 4.84, C.white, 0.14, C.border);
  const headers = ['Part', 'Supplier', 'Plant', 'Contract', 'Current', 'Proposed', 'Delta', 'Status'];
  const widths = [1.44, 1.36, 0.74, 1.43, 1.09, 1.09, 0.86, 1.31];
  let x = 0.89;
  headers.forEach((h, i) => { rounded(s, x, 2.18, widths[i], 0.54, C.navy, 0.04, C.navy); addText(s, h, x + 0.07, 2.32, widths[i] - 0.14, 0.2, { fontSize: 8.3, bold: true, color: C.white, align: 'center' }); x += widths[i]; });
  const rows = [
    ['SYN-1000', 'SYN-V001', 'PL01', '4600001000/10', '2,250', '2,265', '+15', 'READY'],
    ['SYN-2000', 'SYN-V001', 'PL01', '4600001001/20', '1,860', '1,872', '+12', 'REVIEW'],
    ['SYN-3000', 'SYN-V001', 'PL02', '—', '980', '992', '+12', 'EXCEPTION']
  ];
  rows.forEach((r, ri) => {
    let xx = 0.89; const yy = 2.88 + ri * 0.72;
    r.forEach((v, i) => {
      rounded(s, xx, yy, widths[i], 0.58, ri % 2 ? C.light : C.white, 0.02, C.border);
      if (i === 7) statusChip(s, v, xx + 0.08, yy + 0.13, v === 'READY' ? 'green' : (v === 'REVIEW' ? 'amber' : 'red'), widths[i] - 0.16);
      else addText(s, v, xx + 0.07, yy + 0.16, widths[i] - 0.14, 0.24, { fontSize: 8.6, color: i === 6 ? C.purple : C.slate, bold: i === 6, align: i >= 4 ? 'right' : 'left' });
      xx += widths[i];
    });
  });
  rounded(s, 0.89, 5.42, 11.46, 0.77, C.pale, 0.1, C.pale);
  addText(s, 'User decision', 1.15, 5.64, 1.15, 0.25, { fontSize: 9, bold: true, color: C.purple });
  addText(s, 'Open each exception or review item; release only the validated and accepted scope.', 2.28, 5.59, 8.34, 0.34, { fontSize: 9.8, color: C.slate });
  pill(s, 'OPEN WORKBENCH', 10.57, 5.58, 1.5, C.purple, C.white);
}

// 23 release modes
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Choose the correct price-document release mode', 'Simulation supports analysis; amendment creates a governed approval and downstream proposal.', 'User handbook');
  card(s, { x: 0.62, y: 1.82, w: 5.82, h: 3.68, iconName: 'faFlask', title: 'Simulation-only', accent: C.blue, tag: 'NO APPROVAL', body: '' });
  bulletList(s, ['Creates a clearly synthetic preview.', 'Does not call S/4 or create a financially effective document.', 'Useful for sensitivity review and stakeholder discussion.', 'Can be released without maker-checker approval in the trial.'], 0.98, 2.85, 4.94, 2.15, C.slate, 10.3, C.blue);
  card(s, { x: 6.8, y: 1.82, w: 5.82, h: 3.68, iconName: 'faFileSignature', title: 'Amendment', accent: C.purple, tag: 'APPROVAL', body: '' });
  bulletList(s, ['Creates a blocked price document first.', 'Approver reviews context, cost sheet and proposal.', 'Approval unlocks the synthetic downstream handoff.', 'Rejection returns the item for corrective rework.'], 7.16, 2.85, 4.94, 2.15, C.slate, 10.3, C.purple);
  rounded(s, 0.62, 5.82, 12.0, 0.64, C.navy, 0.12, C.navy);
  addText(s, 'Never interpret either trial mode as a real contract update or financial posting.', 0.92, 5.99, 11.4, 0.28, { fontSize: 10.4, bold: true, color: C.white, align: 'center' });
}

// 24 approval & handoff
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Approver decision and downstream handoff', 'The proposal retains the approved context, value change and synthetic execution evidence.', 'User handbook');
  stepFlow(s, [
    { icon: 'faLock', title: 'Blocked document', body: 'Amendment release creates a document that cannot hand off yet.' },
    { icon: 'faUserCheck', title: 'Approver reviews', body: 'Inspect inputs, calculations, findings, scope and comments.' },
    { icon: 'faStamp', title: 'Decision', body: 'Approve to release, or reject with the required corrective guidance.' },
    { icon: 'faArrowUpRightFromSquare', title: 'Synthetic handoff', body: 'Generate an auditable contract-price proposal; no S/4 call occurs.' }
  ], 0.62, 1.82, 12.0, 3.35);
  rounded(s, 0.62, 5.45, 12.0, 1.08, C.palePurple, 0.12, C.palePurple);
  addText(s, 'Verified example', 0.94, 5.65, 1.3, 0.26, { fontSize: 9.5, bold: true, color: C.purple });
  addText(s, 'Current contract price', 2.46, 5.58, 1.7, 0.23, { fontSize: 8.4, bold: true, color: C.muted, align: 'center' });
  addText(s, 'INR 2,250', 2.46, 5.87, 1.7, 0.3, { fontSize: 15, bold: true, color: C.navy, align: 'center' });
  addIcon(s, 'faArrowRight', 4.41, 5.88, 0.2, C.purple);
  addText(s, 'Proposed contract price', 4.88, 5.58, 1.92, 0.23, { fontSize: 8.4, bold: true, color: C.muted, align: 'center' });
  addText(s, 'INR 2,265', 4.88, 5.87, 1.92, 0.3, { fontSize: 15, bold: true, color: C.purple, align: 'center' });
  statusChip(s, 'APPROVED', 7.28, 5.8, 'green', 1.24);
  addText(s, 'Synthetic proposal reference retained', 8.78, 5.73, 3.1, 0.39, { fontSize: 9.6, color: C.slate });
}

// 25 reconciliation
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Reconcile expected and actual proposal values', 'A matched result closes the loop; any difference remains visible for action.', 'User handbook');
  rounded(s, 0.62, 1.85, 12.0, 2.14, C.white, 0.14, C.border);
  const rec = [['Expected', 'INR 2,265', C.blue], ['Actual', 'INR 2,265', C.purple], ['Difference', 'INR 0', C.green]];
  rec.forEach((r, i) => {
    const x = 1.2 + i * 3.82;
    addText(s, r[0], x, 2.26, 2.72, 0.28, { fontSize: 10, bold: true, color: C.muted, align: 'center' });
    addText(s, r[1], x, 2.72, 2.72, 0.55, { fontSize: 24, bold: true, color: r[2], align: 'center' });
  });
  rounded(s, 0.62, 4.34, 7.52, 2.0, C.white, 0.12, C.border);
  addText(s, 'If the difference is zero', 0.94, 4.62, 2.3, 0.3, { fontSize: 13, bold: true, color: C.green });
  bulletList(s, ['Record MATCHED status and comparison timestamp.', 'Retain expected/actual values and proposal reference.', 'Use the evidence for review and period-close traceability.'], 0.96, 5.04, 6.65, 0.95, C.slate, 9.5, C.green);
  rounded(s, 8.41, 4.34, 4.21, 2.0, C.redPale, 0.12, C.redPale);
  addText(s, 'If a difference exists', 8.73, 4.62, 2.35, 0.3, { fontSize: 13, bold: true, color: C.red });
  addText(s, 'Keep the item open, inspect the calculation/proposal version, and correct through governed action — never by editing approved data.', 8.73, 5.08, 3.57, 0.76, { fontSize: 9.7, color: C.slate, valign: 'top' });
}

// 26 retrospective calc
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Retrospective calculation: quantity eligibility and impact evidence', 'The retained trial calculation demonstrates receipt, reversal and exact-decimal impact behavior.', 'User handbook');
  const q = [['101 receipt', '+300', C.green], ['102 reversal', '−20', C.red], ['Eligible quantity', '280', C.blue], ['Impact', 'INR 4,200', C.purple]];
  q.forEach((m, i) => card(s, { x: 0.62 + i * 3.03, y: 1.88, w: 2.78, h: 1.62, title: m[0], value: m[1], accent: m[2] }));
  rounded(s, 0.62, 3.86, 12.0, 2.45, C.white, 0.14, C.border);
  addText(s, 'What the calculation retains', 0.95, 4.15, 3.0, 0.33, { fontSize: 15, bold: true, color: C.navy });
  bulletList(s, ['Input snapshot and rule-set/version context', 'GR reference, movement sign and eligible quantity', 'Profile/composition and current/proposed RM price', 'Formula explanation and line-level amount', 'Run status, approval, posting simulation and reconciliation references'], 0.97, 4.7, 5.18, 1.28, C.slate, 9.5, C.blue);
  rounded(s, 6.56, 4.13, 5.62, 1.72, C.pale, 0.12, C.pale);
  addIcon(s, 'faCalculator', 6.91, 4.59, 0.66, C.purple);
  addText(s, 'Exact decimal arithmetic', 7.82, 4.42, 3.66, 0.32, { fontSize: 13, bold: true, color: C.purple });
  addText(s, 'Money and quantities never rely on binary floating point. Result lines remain reproducible and explainable.', 7.82, 4.92, 3.83, 0.58, { fontSize: 9.8, color: C.slate, valign: 'top' });
}

// 27 reversal rerun
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Corrective controls: reverse safely and rerun without overwriting history', 'Recovery actions create new evidence and preserve the original business record.', 'User handbook');
  card(s, { x: 0.62, y: 1.82, w: 5.82, h: 3.86, iconName: 'faRotateLeft', title: 'Simulated posting reversal', accent: C.red, body: '' });
  bulletList(s, ['Creates a separate reversal record linked to the original simulation.', 'Uses an idempotency key to prevent accidental duplicate reversal.', 'Replay returns the existing reversal record.', 'Original simulated posting evidence remains unchanged.'], 0.98, 2.86, 4.9, 2.12, C.slate, 10.2, C.red);
  card(s, { x: 6.8, y: 1.82, w: 5.82, h: 3.86, iconName: 'faCodeBranch', title: 'Calculation rerun', accent: C.purple, body: '' });
  bulletList(s, ['Creates a new queued run with an explicit rerunOf lineage link.', 'Records a reason and fresh immutable result lines.', 'Never overwrites the source calculation.', 'Verified rerun reproduces 280 units and INR 4,200.'], 7.16, 2.86, 4.9, 2.12, C.slate, 10.2, C.purple);
  rounded(s, 2.2, 6.02, 8.96, 0.5, C.navy, 0.1, C.navy);
  addText(s, 'Principle: correct by reversal, supersession or new version — never edit approved evidence in place.', 2.46, 6.13, 8.45, 0.22, { fontSize: 9.4, bold: true, color: C.white, align: 'center' });
}

// 28 status/error
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Status and error quick reference', 'Use the status text and corrective message — color is never the only signal.', 'User handbook');
  const statuses = [
    ['DRAFT', 'grey', 'Editable by the owning maker persona.'], ['SUBMITTED', 'blue', 'Locked for reviewer action.'],
    ['APPROVED', 'green', 'Controlling version; immutable.'], ['REJECTED', 'red', 'Correct and create/resubmit the appropriate version.'],
    ['BLOCKED', 'red', 'A mandatory finding or approval gate prevents progress.'], ['EXCLUDED', 'amber', 'Advisory accepted with documented reason.'],
    ['MATCHED', 'green', 'Expected and actual values reconcile.'], ['SUPERSEDED', 'purple', 'Historical version replaced by a newer approved version.']
  ];
  statuses.forEach((st, i) => {
    const x = 0.62 + (i % 2) * 6.12, y = 1.76 + Math.floor(i / 2) * 1.1;
    rounded(s, x, y, 5.82, 0.9, C.white, 0.1, C.border);
    statusChip(s, st[0], x + 0.24, y + 0.28, st[1], 1.35);
    addText(s, st[2], x + 1.82, y + 0.21, 3.72, 0.48, { fontSize: 9.5, color: C.slate });
  });
  rounded(s, 0.62, 6.35, 12.0, 0.4, C.palePurple, 0.1, C.palePurple);
  addText(s, 'Tip: stale-version errors mean another action changed the object. Refresh, review the newest version and retry intentionally.', 0.86, 6.42, 11.5, 0.22, { fontSize: 8.9, bold: true, color: C.purple, align: 'center' });
}

// 29 day in life
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'A complete demo scenario in 12 checkpoints', 'Use this sequence for training, stakeholder walkthroughs and Trial Gate T1 acceptance.', 'User handbook');
  const checks = [
    'Confirm demo banner and clean seed state', 'Create/close/mark a commodity', 'Request and activate an RM code',
    'Search a valid contract and create linkage', 'Create/approve missing-contract exception', 'Allocate the contract later',
    'Explore BOM and map leaf components', 'Submit/approve composition revision', 'Approve RM price and inspect impacted parts',
    'Review cost sheet and INR 4,200 impact', 'Approve amendment and verify INR 2,265 proposal', 'Reconcile, reverse and rerun evidence'
  ];
  checks.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3), x = 0.62 + col * 4.05, y = 1.72 + row * 1.18;
    rounded(s, x, y, 3.75, 0.96, C.white, 0.1, C.border);
    iconBadge(s, 'faCheck', x + 0.2, y + 0.22, [C.blue, C.purple, C.indigo][col], 0.42);
    addText(s, String(i + 1).padStart(2, '0'), x + 0.77, y + 0.2, 0.34, 0.2, { fontSize: 7.5, bold: true, color: C.muted });
    addText(s, t, x + 0.77, y + 0.39, 2.73, 0.38, { fontSize: 9.1, bold: true, color: C.navy, valign: 'top' });
  });
  rounded(s, 0.62, 6.54, 12.0, 0.3, C.navy, 0.08, C.navy);
  addText(s, 'Record every observation as ACCEPT • CHANGE • DEFER • REJECT with owner and acceptance criteria.', 0.9, 6.57, 11.45, 0.19, { fontSize: 8.4, bold: true, color: C.white, align: 'center' });
}

sectionSlide('03', 'Controls, architecture & roadmap', 'How the trial protects correctness today and transitions responsibly toward SAP S/4HANA.', 'faShieldHalved');

// 31 controls
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Controls are part of the product experience', 'The design makes compliant behavior the natural path for users.', 'Controls & roadmap');
  const controls = [
    ['faUserShield', 'Segregation of duties', 'Maker and approver actions are distinct and role-gated.'],
    ['faLock', 'Approved immutability', 'Corrections create a reversal, supersession or new revision.'],
    ['faFingerprint', 'Idempotency', 'Replay-safe posting/reversal keys prevent duplicate outcomes.'],
    ['faCodeBranch', 'Version & lineage', 'Every decision targets a known object version; reruns link to source.'],
    ['faCalculator', 'Deterministic decimals', 'Financial results use exact decimal arithmetic and retained traces.'],
    ['faClockRotateLeft', 'Audit evidence', 'Actor, decision, comment, time, status and evidence remain inspectable.'],
    ['faBuildingShield', 'Organizational scope', 'Production checks company code, purchasing org, plant and supplier.'],
    ['faEye', 'Read-only projections', 'Governed data cannot be bypassed through direct entity writes.']
  ];
  controls.forEach((c, i) => card(s, { x: 0.62 + (i % 4) * 3.03, y: 1.74 + Math.floor(i / 4) * 2.35, w: 2.78, h: 2.05, iconName: c[0], title: c[1], body: c[2], accent: [C.blue, C.purple, C.indigo, C.cyan][i % 4] }));
}

// 32 architecture
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Trial architecture with a clean-core transition path', 'Stable domain workflows sit above replaceable adapters; productive persistence remains in S/4.', 'Controls & roadmap');
  const layers = [
    ['Business users', 'SAPUI5 / Fiori-style role experience', 'faUsers', C.blue],
    ['Application', 'SAP CAP services, validations, workflow and exact-decimal calculations', 'faCubes', C.purple],
    ['Ports', 'Reference data • repository • posting • contract update • identity', 'faPlug', C.indigo],
    ['Trial adapters', 'Synthetic seed store • mock reference data • posting simulator', 'faFlask', C.cyan]
  ];
  layers.forEach((l, i) => {
    rounded(s, 1.1 + i * 0.35, 1.76 + i * 1.12, 10.5 - i * 0.7, 0.86, l[3], 0.12, l[3]);
    addIcon(s, l[2], 1.42 + i * 0.35, 1.99 + i * 1.12, 0.36, C.white);
    addText(s, l[0], 1.98 + i * 0.35, 1.9 + i * 1.12, 2.2, 0.3, { fontSize: 11.5, bold: true, color: C.white });
    addText(s, l[1], 4.05 + i * 0.18, 1.9 + i * 1.12, 6.55 - i * 0.55, 0.3, { fontSize: 9.8, color: C.white, align: 'right' });
  });
  rounded(s, 0.62, 6.26, 12.0, 0.54, C.navy, 0.12, C.navy);
  addText(s, 'After Gate T3: replace trial adapters with verified released S/4 APIs and clean-core custom services — preserve business rules and UI contracts.', 0.88, 6.38, 11.48, 0.29, { fontSize: 9.4, bold: true, color: C.white, align: 'center' });
}

// Business data lineage
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Business data lineage: every outcome keeps its source story', 'The application links foundation records, decisions and downstream evidence without hiding transformations.', 'Controls & roadmap');
  const nodes = [
    [0.72, 2.18, 'Master data', 'Type • grade • subgrade', 'faDatabase', C.blue],
    [3.18, 1.46, 'Commercial context', 'Supplier • part • contract', 'faLink', C.purple],
    [5.66, 2.18, 'Composition', 'BOM path • leaf • quantity', 'faSitemap', C.indigo],
    [8.14, 1.46, 'Approved RM price', 'Old/new • unit • validity', 'faTags', C.violet],
    [10.6, 2.18, 'Proposal', 'Current • proposed • reference', 'faFileContract', C.cyan],
    [8.14, 4.62, 'Reconciliation', 'Expected • actual • difference', 'faScaleBalanced', C.green],
    [5.66, 5.34, 'Calculation evidence', 'GR • movement • formula', 'faCalculator', C.purple],
    [3.18, 4.62, 'Workflow evidence', 'Actor • version • decision', 'faClockRotateLeft', C.blue]
  ];
  const centerX = 6.66, centerY = 3.73;
  nodes.forEach((n) => {
    const nx = n[0] + 0.88, ny = n[1] + 0.48;
    connector(s, nx, ny, centerX, centerY, { color: 'C4B5FD', transparency: 30, width: 1.3 });
  });
  s.addShape(pptx.ShapeType.ellipse, { x: 5.77, y: 2.84, w: 1.78, h: 1.78, fill: { color: C.navy }, line: { color: C.white, width: 2 }, shadow: { type: 'outer', color: '000000', opacity: 0.18, blur: 2, angle: 45, distance: 1 } });
  addIcon(s, 'faFingerprint', 6.29, 3.24, 0.74, C.white);
  addText(s, 'TRACE', 6.02, 4.09, 1.27, 0.2, { fontSize: 8.2, bold: true, color: 'A5B4FC', align: 'center', charSpacing: 1.2 });
  nodes.forEach((n) => {
    rounded(s, n[0], n[1], 1.76, 0.96, C.white, 0.1, C.border);
    iconBadge(s, n[4], n[0] + 0.16, n[1] + 0.22, n[5], 0.42);
    addText(s, n[2], n[0] + 0.7, n[1] + 0.14, 0.92, 0.25, { fontSize: 8.8, bold: true, color: C.navy });
    addText(s, n[3], n[0] + 0.7, n[1] + 0.44, 0.92, 0.3, { fontSize: 7.2, color: C.muted, valign: 'top' });
  });
}

// 33 boundaries
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Know what the current application is — and is not', 'Clear boundaries protect demonstrations from being mistaken for productive operation.', 'Controls & roadmap');
  card(s, { x: 0.62, y: 1.8, w: 5.82, h: 4.75, iconName: 'faCircleCheck', title: 'Available now in the trial', accent: C.green, body: '' });
  bulletList(s, ['Complete confirmed persona journeys', 'Synthetic end-to-end workflows and exceptions', 'Exact-decimal workbench and calculation evidence', 'Simulation, proposal, reversal, rerun and reconciliation', 'Dummy authentication and declared future role templates', 'Disposable in-memory SQLite seed state'], 0.98, 2.84, 4.96, 3.02, C.slate, 10.2, C.green);
  card(s, { x: 6.8, y: 1.8, w: 5.82, h: 4.75, iconName: 'faRoadBarrier', title: 'Intentionally deferred', accent: C.amber, body: '' });
  bulletList(s, ['BTP trial deployment until explicitly requested', 'Any real S/4 connectivity or business data before Gate T3', 'Productive IAS/XSUAA assignments and org attributes', 'Released contract/BOM/material-document adapters', 'Financial posting, contract update and Flexible Workflow', 'Productive persistence, monitoring, migration and load/security testing'], 7.16, 2.84, 4.96, 3.02, C.slate, 10.2, C.amber);
}

// 34 gates
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'A gated roadmap from demonstrator to productive landscape', 'Business acceptance comes before real integration and production engineering.', 'Controls & roadmap');
  const gates = [
    ['T0', 'Foundation', 'Architecture, synthetic data, repo and demo shell', 'COMPLETE', 'green'],
    ['T1', 'Demonstrator', 'End-to-end journeys, controls and evidence', 'REVIEW', 'purple'],
    ['T2', 'Scope convergence', 'Field-level acceptance, rules and ≥90% definition', 'NEXT', 'blue'],
    ['T3', 'Real-landscape authority', 'Formal approval for identity, BTP and non-prod S/4', 'GATED', 'amber'],
    ['P1–P5', 'Productive delivery', 'API feasibility, foundation, features, posting and readiness', 'FUTURE', 'grey']
  ];
  gates.forEach((g, i) => {
    const y = 1.76 + i * 0.98;
    rounded(s, 0.7, y, 11.83, 0.78, C.white, 0.1, C.border);
    rounded(s, 0.7, y, 0.85, 0.78, [C.green, C.purple, C.blue, C.amber, C.slate][i], 0.1, [C.green, C.purple, C.blue, C.amber, C.slate][i]);
    addText(s, g[0], 0.79, y + 0.22, 0.66, 0.26, { fontSize: 11, bold: true, color: C.white, align: 'center' });
    addText(s, g[1], 1.82, y + 0.14, 2.18, 0.25, { fontSize: 11.5, bold: true, color: C.navy });
    addText(s, g[2], 4.15, y + 0.14, 6.48, 0.35, { fontSize: 9.2, color: C.slate });
    statusChip(s, g[3], 10.88, y + 0.22, g[4], 1.28);
  });
  rounded(s, 0.7, 6.81, 11.83, 0.24, C.navy, 0.06, C.navy);
}

// 35 success measures
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Business success measures', 'Agree targets during Trial Gate T2, then use the application evidence to monitor improvement.', 'Controls & roadmap');
  const kpis = [
    ['faStopwatch', 'Cycle time', 'Request → approved price document'],
    ['faCircleCheck', 'First-time-right', '% submissions without blocking findings'],
    ['faTriangleExclamation', 'Exception aging', 'Open mandatory findings by owner/status'],
    ['faChartLine', 'Exposure visibility', 'Value of impacted parts and pending decisions'],
    ['faScaleBalanced', 'Reconciliation quality', '% matched proposals; value of differences'],
    ['faRotate', 'Recovery reliability', 'Duplicate prevention and successful reversal/rerun'],
    ['faUsers', 'Adoption', 'Active users and journey completion by persona'],
    ['faShieldHalved', 'Control health', 'Stale approvals, overrides and audit completeness']
  ];
  kpis.forEach((k, i) => card(s, { x: 0.62 + (i % 4) * 3.03, y: 1.76 + Math.floor(i / 4) * 2.32, w: 2.78, h: 2.02, iconName: k[0], title: k[1], body: k[2], accent: [C.blue, C.purple, C.indigo, C.cyan][i % 4] }));
  rounded(s, 0.62, 6.53, 12.0, 0.3, C.palePurple, 0.08, C.palePurple);
  addText(s, 'No target is assumed in this deck; business owners should confirm baselines, volumes and service levels.', 0.9, 6.57, 11.45, 0.2, { fontSize: 8.5, bold: true, color: C.purple, align: 'center' });
}

// 36 open decisions
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Decisions required before productive design', 'The trial demonstrates the workflow; these business facts must be confirmed rather than invented.', 'Controls & roadmap');
  const qs = [
    ['Landscape', 'S/4 edition/FPS, BTP region, quota and identity model'],
    ['Current process', 'Exact Vistex scope, fields, rules, reports and configured objects'],
    ['Accounting', 'MRNB-equivalent outcome, movement/date eligibility and reversal rules'],
    ['BOM', 'Alternatives, phantom/configurable materials, scrap and subcontracting'],
    ['Pricing', 'Index/lag/FX/premium/floor-cap logic, price units and rounding'],
    ['Approval', 'Final authority in custom app, S/4 Flexible Workflow or both'],
    ['Records', 'Evidence, content repository, retention and fiscal-close needs'],
    ['Scale', 'Contracts, parts, BOM depth, GR volume, vendors and concurrent users']
  ];
  qs.forEach((q, i) => {
    const x = 0.62 + (i % 2) * 6.12, y = 1.74 + Math.floor(i / 2) * 1.13;
    rounded(s, x, y, 5.82, 0.93, C.white, 0.1, C.border);
    iconBadge(s, 'faQuestion', x + 0.22, y + 0.23, i % 2 ? C.purple : C.blue, 0.42);
    addText(s, q[0], x + 0.82, y + 0.15, 1.23, 0.24, { fontSize: 10.5, bold: true, color: C.navy });
    addText(s, q[1], x + 2.02, y + 0.12, 3.46, 0.53, { fontSize: 8.9, color: C.slate, valign: 'top' });
  });
  rounded(s, 0.62, 6.44, 12.0, 0.35, C.navy, 0.08, C.navy);
  addText(s, 'These map to the binding OQ-01 through OQ-15 register in PROJECT_GUIDELINES.md.', 0.9, 6.5, 11.45, 0.2, { fontSize: 8.6, bold: true, color: C.white, align: 'center' });
}

// 37 glossary
{
  const s = pptx.addSlide('RMC_MASTER');
  addTitle(s, 'Quick-reference glossary', 'Shared language for business walkthroughs and acceptance sessions.', 'Appendix');
  const terms = [
    ['RMC', 'Raw Material Content Management'], ['RM', 'Raw material type, grade and optional subgrade'],
    ['Linkage', 'Effective-dated supplier–part–plant–contract relationship'], ['Composition', 'Versioned leaf-level raw-material content for a part'],
    ['Finding', 'Mandatory or advisory workflow issue requiring action/evidence'], ['Workbench', 'Server-calculated cost, impact and workflow decision cockpit'],
    ['Price document', 'Synthetic simulation or amendment object for approval/handoff'], ['Handoff', 'Trial contract-price proposal; never a real S/4 update'],
    ['Reconciliation', 'Comparison of expected and actual downstream proposal value'], ['Rerun', 'New calculation linked to its source without overwriting it'],
    ['Idempotency', 'Same request/key returns the same outcome, preventing duplicates'], ['Clean core', 'Released interfaces and governed extensions; no direct S/4 table access']
  ];
  terms.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3), x = 0.62 + col * 4.05, y = 1.68 + row * 1.22;
    rounded(s, x, y, 3.75, 1.02, C.white, 0.1, C.border);
    addText(s, t[0], x + 0.23, y + 0.18, 1.03, 0.25, { fontSize: 10.4, bold: true, color: [C.blue, C.purple, C.indigo][col] });
    addText(s, t[1], x + 1.22, y + 0.14, 2.27, 0.56, { fontSize: 8.7, color: C.slate, valign: 'top' });
  });
}

// 38 close
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.ellipse, { x: -1.0, y: 4.55, w: 4.2, h: 4.2, fill: { color: C.blue, transparency: 18 }, line: { color: C.blue, transparency: 100 } });
  s.addShape(pptx.ShapeType.ellipse, { x: 9.35, y: -1.35, w: 5.3, h: 5.3, fill: { color: C.purple, transparency: 15 }, line: { color: C.purple, transparency: 100 } });
  rounded(s, 5.73, 0.88, 1.85, 1.85, C.white, 0.23, C.white);
  addIcon(s, 'faCubes', 6.23, 1.38, 0.85, C.purple);
  addText(s, 'One governed journey.\nClearer decisions. Stronger evidence.', 1.7, 3.12, 9.95, 1.25, { fontSize: 31, bold: true, color: C.white, align: 'center', valign: 'top', breakLine: true });
  addText(s, 'Ready for business visual review and Trial Gate T1 acceptance.', 2.18, 4.7, 8.96, 0.42, { fontSize: 15, color: 'D7E3FF', align: 'center' });
  pill(s, 'NEXT: REVIEW • RECORD • REFINE', 5.18, 5.62, 3.0, C.violet, C.white);
  addText(s, 'Raw Material Content Management', 4.55, 6.88, 4.22, 0.23, { fontSize: 9, bold: true, color: 'A5B4FC', align: 'center', charSpacing: 0.7 });
}

// Add source and boundary notes to every slide when supported.
pptx._slides.forEach((slide, index) => {
  if (!slide._notes || slide._notes.length === 0) {
    addNotes(slide, `Slide ${index + 1}. Current trial application scope verified on 2026-10-31. Synthetic data only; no productive S/4 connectivity or posting.`);
  }
});

pptx.writeFile({ fileName: OUT })
  .then(() => console.log(`Created ${OUT}`))
  .catch((error) => { console.error(error); process.exitCode = 1; });
