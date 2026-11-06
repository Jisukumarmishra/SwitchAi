const { Router } = require('express');
const config = require('../config/env');

const router = Router();

/**
 * Integration status endpoint.
 */
router.get('/status', (_req, res) => {
  res.json({
    data: {
      switch: {
        enabled: config.SWITCH_ENABLED,
        status: config.SWITCH_ENABLED ? 'configured' : 'not_configured',
        mode: config.SWITCH_ENABLED ? 'live' : 'local_demo',
      },
      ai: {
        provider: config.AI_PROVIDER,
        status: config.AI_PROVIDER === 'mock' ? 'demo_mode' : 'configured',
      },
      database: {
        mode: config.DATA_MODE,
        status: config.DATA_MODE === 'memory' ? 'in_memory' : 'connected',
      },
      demo: {
        enabled: config.DEMO_MODE,
      },
    },
  });
});

module.exports = router;
