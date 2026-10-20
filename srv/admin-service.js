'use strict';

const cds = require('@sap/cds');
const { validateSetting } = require('./lib/configuration');

module.exports = class AdminService extends cds.ApplicationService {
  async init() {
    const entities = cds.entities('rmc');

    this.before(['CREATE', 'UPDATE'], 'AppSettings', async (req) => {
      let candidate = { ...req.data };
      if (!candidate.settingKey && req.params?.[0]?.settingKey) candidate.settingKey = req.params[0].settingKey;
      if (req.event === 'UPDATE' && candidate.settingKey) {
        const current = await cds.tx(req).run(
          SELECT.one.from(entities.AppSettings).where({ settingKey: candidate.settingKey })
        );
        candidate = { ...current, ...candidate };
      }
      if (candidate.settingKey && candidate.value !== undefined) {
        try {
          validateSetting(candidate);
        } catch (error) {
          req.reject(400, error.message);
        }
      }
    });

    this.before(['CREATE', 'UPDATE'], 'MovementTypeRules', (req) => {
      if (req.data.quantitySign !== undefined && ![-1, 1].includes(Number(req.data.quantitySign))) {
        req.reject(400, 'Movement-type quantitySign must be 1 or -1.');
      }
    });

    this.before(['CREATE', 'UPDATE'], 'PriceRuleTemplates', (req) => {
      const allowed = ['DIRECT', 'PERCENT', 'INDEX_AVERAGE'];
      if (req.data.method && !allowed.includes(req.data.method)) {
        req.reject(400, `Method must be one of ${allowed.join(', ')}.`);
      }
      if (req.data.roundingScale !== undefined && (req.data.roundingScale < 0 || req.data.roundingScale > 6)) {
        req.reject(400, 'Rounding scale must be between 0 and 6.');
      }
    });

    this.on('resetDemoData', (req) => {
      if (process.env.RMC_DEMO_MODE === 'false') req.reject(403, 'Demo reset is disabled outside the demo profile.');
      return 'Stop the application and run npm run reset:demo, then restart it. This deliberate offline reset prevents accidental deletion through a public demo endpoint.';
    });

    await super.init();
  }
};
