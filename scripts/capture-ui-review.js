'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const root = path.resolve(__dirname, '..');
const evidenceName = process.env.RMC_EVIDENCE_NAME || 'ui-2026-10-31-dashboard-1440';
const viewportWidth = Number(process.env.RMC_VIEWPORT_WIDTH || 1440);
const viewportHeight = Number(process.env.RMC_VIEWPORT_HEIGHT || 900);
const outputDir = path.join(root, 'docs', 'review-evidence', evidenceName);
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const baseUrl = 'http://localhost:4004/rmc/webapp/index.html';

function safeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function capture(page, name, fullPage = false) {
  const file = path.join(outputDir, `${safeName(name)}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 88, fullPage });
  return path.relative(root, file).replace(/\\/g, '/');
}

async function captureTable(page, title, name) {
  const file = path.join(outputDir, `${safeName(name)}.jpg`);
  const table = page.getByText(title, { exact: true }).first().locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " sapMList ")][1]');
  await table.screenshot({ path: file, type: 'jpeg', quality: 88 });
  return path.relative(root, file).replace(/\\/g, '/');
}

async function selectTab(page, text) {
  const item = page.locator('[id$="--sideNavigation"]').getByText(text, { exact: true }).first();
  await item.click();
  await page.waitForTimeout(900);
}

async function selectPersona(page, text) {
  await page.locator('[id$="--personaSelect"]').click();
  await page.locator('.sapMSelectListItem').filter({ hasText: text }).click();
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelector('.sapMPageEnableScrolling')?.scrollTo(0, 0);
  });
  await page.waitForTimeout(4000);
}

async function scrollToText(page, text) {
  const target = page.getByText(text, { exact: true }).first();
  await target.evaluate((element) => element.scrollIntoView({ block: 'start', inline: 'nearest' }));
  await page.waitForTimeout(500);
}

async function scrollPageTop(page) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelector('.sapMPageEnableScrolling')?.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
}

async function scanDarkSurfaces(page, screen) {
  return page.evaluate((screenName) => {
    const selectors = ['.rmcHeader', '.rmcHero', '.rmcWorkbenchHero', '.rmcPriceStateCard', '.rmcDecisionImpact', '.rmcImpactVisual', '.rmcAnalyticsHero'];
    const nodes = selectors.flatMap((selector) => Array.from(document.querySelectorAll(`${selector} .sapMText, ${selector} .sapMTitle, ${selector} .sapUiIcon, ${selector} .sapMObjStatusText, ${selector} .sapMObjStatusIcon, ${selector} .sapMObjectNumberText, ${selector} .sapMObjectNumberUnit`)));
    return Array.from(new Set(nodes)).filter((node) => {
      if (!node.getClientRects().length || node.closest('.rmcPersonaSelect')) return false;
      const match = getComputedStyle(node).color.match(/\d+(?:\.\d+)?/g);
      if (!match || match.length < 3) return false;
      const [r, g, b] = match.map(Number);
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      return luminance < 0.6;
    }).map((node) => ({ screen: screenName, text: node.textContent.trim().slice(0, 80), color: getComputedStyle(node).color, className: node.className }));
  }, screen);
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: edge, headless: true, args: ['--disable-gpu'] });
  const context = await browser.newContext({ viewport: { width: viewportWidth, height: viewportHeight }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const evidence = [];
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('[id$="--sideNavigation"]', { timeout: 30000 });
  evidence.push(await capture(page, '01-overview'));
  await scrollToText(page, 'Current to proposed part price');
  evidence.push(await capture(page, '01b-overview-analytics'));
  await scrollToText(page, 'Seven-stage business journey');
  evidence.push(await capture(page, '01c-overview-journey'));

  await selectTab(page, 'Analytics Dashboard');
  await scrollPageTop(page);
  evidence.push(await capture(page, '01d-analytics-dashboard-top'));
  await scrollToText(page, 'Exposure by supplier');
  evidence.push(await capture(page, '01e-analytics-comparisons'));
  await scrollToText(page, 'Monthly exposure trend');
  evidence.push(await capture(page, '01f-analytics-impact-trend'));

  await selectTab(page, 'Master Data');
  await scrollPageTop(page);
  evidence.push(await capture(page, '02-master-data-top'));
  await scrollToText(page, 'Acceptable commodities');
  evidence.push(await capture(page, '03-master-data-catalog'));

  await selectTab(page, 'Commodity Prices');
  await scrollPageTop(page);
  evidence.push(await capture(page, '03b-commodity-price-governance'));
  await scrollToText(page, 'Create governed price change');
  await page.getByText('Create governed price change', { exact: true }).click();
  await page.waitForTimeout(500);
  evidence.push(await capture(page, '03c-governed-price-creation'));

  await selectTab(page, 'Pricing Workbench');
  await scrollPageTop(page);
  evidence.push(await capture(page, '04-pricing-workbench-top'));
  await scrollToText(page, 'SOURCE INTEGRITY');
  evidence.push(await capture(page, '04b-pricing-decision-rail'));
  await scrollToText(page, 'Impacted parts from vendor-part linkage');
  evidence.push(await capture(page, '05-impacted-parts'));
  await scrollToText(page, 'Reconciliation evidence');
  evidence.push(await capture(page, '06-reconciliation'));

  await selectTab(page, 'Part RM Content');
  await scrollPageTop(page);
  evidence.push(await capture(page, '07-part-rm-content-top'));
  await scrollToText(page, 'Workflow and data-quality findings');
  evidence.push(await capture(page, '08-workflow-findings'));
  await scrollToText(page, 'Approved revisioned composition');
  evidence.push(await capture(page, '09-approved-composition'));

  await scrollToText(page, 'Engineering and commercial attributes from legacy VPL');
  await page.getByText('Engineering and commercial attributes from legacy VPL', { exact: true }).click();
  await page.waitForTimeout(500);
  evidence.push(await capture(page, '09b-legacy-engineering-attributes'));

  await selectTab(page, 'Controls & Audit');
  await scrollPageTop(page);
  evidence.push(await capture(page, '10-legacy-control-matrix'));
  await scrollToText(page, 'Approval and decision history');
  evidence.push(await captureTable(page, 'Approval and decision history', '11-approval-audit-history'));
  await scrollToText(page, 'Execution and background references');
  evidence.push(await captureTable(page, 'Execution and background references', '12-execution-correlation-evidence'));

  await scrollPageTop(page);
  await selectPersona(page, 'Buyer');
  evidence.push(await capture(page, '13-persona-buyer'));
  await selectPersona(page, 'RM Admin');
  evidence.push(await capture(page, '14-persona-rm-admin'));
  await selectPersona(page, 'Commodity Admin');
  evidence.push(await capture(page, '15-persona-commodity-admin'));
  await selectPersona(page, 'Approver');
  evidence.push(await capture(page, '16-persona-approver'));
  await page.getByTitle('Expand or collapse navigation').click();
  await page.waitForTimeout(500);
  evidence.push(await capture(page, '17-navigation-collapsed'));
  await page.getByTitle('Expand or collapse navigation').click();
  await page.waitForTimeout(500);

  await selectPersona(page, 'All personas (demo)');
  await selectTab(page, 'Overview');
  const darkSurfaceIssues = await scanDarkSurfaces(page, 'Overview');
  await selectTab(page, 'Analytics Dashboard');
  darkSurfaceIssues.push(...await scanDarkSurfaces(page, 'Analytics Dashboard'));
  await selectTab(page, 'Commodity Prices');
  darkSurfaceIssues.push(...await scanDarkSurfaces(page, 'Commodity Prices'));
  await selectTab(page, 'Pricing Workbench');
  darkSurfaceIssues.push(...await scanDarkSurfaces(page, 'Pricing Workbench'));

  const layout = await page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('.sapMListTbl')).map((table, index) => ({
      index,
      clientWidth: table.clientWidth,
      scrollWidth: table.scrollWidth,
      horizontalOverflow: table.scrollWidth > table.clientWidth
    }));
    return {
      viewportWidth: document.documentElement.clientWidth,
      pageScrollWidth: document.documentElement.scrollWidth,
      globalHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      visibleTabs: Array.from(document.querySelectorAll('[id$="--sideNavigation"] .sapMText')).filter((node) => node.getClientRects().length).map((node) => node.textContent.trim()).filter(Boolean),
      tables
    };
  });

  const report = {
    capturedAt: new Date().toISOString(),
    url: baseUrl,
    viewport: `${viewportWidth}x${viewportHeight}`,
    evidence,
    consoleErrors,
    pageErrors,
    darkSurfaceIssues,
    layout
  };
  fs.writeFileSync(path.join(outputDir, 'browser-review.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
