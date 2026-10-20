'use strict';

const os = require('node:os');
const cds = require('@sap/cds');
const { CalculationWorker } = require('./srv/lib/calculation-worker');

let workerTimer;

cds.on('bootstrap', (app) => {
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'UP', demoMode: process.env.RMC_DEMO_MODE !== 'false' });
  });
});

cds.on('served', async () => {
  if (process.env.RMC_WORKER_ENABLED === 'false') return;
  const worker = new CalculationWorker({ workerId: `${os.hostname()}-${process.pid}` });
  const interval = Math.max(1000, Number(process.env.RMC_WORKER_POLL_MS || 3000));
  await worker.poll();
  workerTimer = setInterval(() => worker.poll(), interval);
  workerTimer.unref();
});

cds.on('shutdown', () => {
  if (workerTimer) clearInterval(workerTimer);
});

module.exports = cds.server;
