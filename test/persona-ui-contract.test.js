'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const component = fs.readFileSync(path.join(root, 'app/rmc/webapp/Component.js'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'app/rmc/webapp/controller/App.controller.js'), 'utf8');
const view = fs.readFileSync(path.join(root, 'app/rmc/webapp/view/App.view.xml'), 'utf8');

test('provides a demo persona switcher for every confirmed business persona', () => {
  for (const persona of ['BUYER', 'RM_ADMIN', 'COMMODITY_ADMIN', 'APPROVER']) {
    assert.match(component, new RegExp(`key: "${persona}"`));
    assert.match(controller, new RegExp(`${persona}: \\{`));
  }
  assert.match(view, /id="personaSelect"/);
  assert.match(view, /change="\.onPersonaChange"/);
});

test('separates maker, master-admin and approver controls in the UI', () => {
  assert.match(view, /Create governed price change[^>]+visible="\{app>\/persona\/canBuyer\}"/);
  assert.match(view, /Commodity Admin maintenance[^>]+visible="\{app>\/persona\/canCommodityAdmin\}"/);
  assert.match(view, /onApproveRmRequest" visible="\{app>\/persona\/canRmAdmin\}"/);
  assert.match(view, /onApprovePrice" visible="\{app>\/persona\/canApprover\}"/);
  assert.match(view, /onApproveComposition"[^>]+visible="\{app>\/persona\/canApprover\}"/);
});

test('provides a collapsible persona-aware side navigation without AI features', () => {
  assert.match(view, /<tnt:SideNavigation/);
  assert.match(view, /press="\.onToggleSideNavigation"/);
  assert.match(controller, /onNavigationSelect:/);
  assert.doesNotMatch(view, /AI Price|AI Suggest|Generative AI/i);
});

test('provides a synthetic analytics dashboard without moving calculation authority to the browser', () => {
  assert.match(view, /key="analytics" text="Analytics Dashboard"/);
  assert.match(view, /12-month movement/);
  assert.match(view, /Exposure by supplier/);
  assert.match(view, /Normalized index comparison/);
  assert.match(view, /governed calculations remain server-owned/);
});
