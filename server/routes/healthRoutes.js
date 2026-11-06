const { Router } = require('express');
const config = require('../config/env');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    dataMode: config.DATA_MODE,
    demoMode: config.DEMO_MODE,
    switchEnabled: config.SWITCH_ENABLED,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
