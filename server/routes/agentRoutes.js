const { Router } = require('express');

const router = Router();

/**
 * Agent routes — returns info about the three AI agents.
 */
module.exports = function createAgentRoutes(orchestrator) {
  router.get('/', (_req, res) => {
    const agents = orchestrator.getAgents().map((a, i) => {
      const extras = [
        {
          color: 'violet',
          responsibilities: [
            'Incident classification',
            'Severity assessment',
            'Service identification',
            'Priority assignment',
            'Initial triage recommendations',
          ],
        },
        {
          color: 'cyan',
          responsibilities: [
            'Log analysis & pattern detection',
            'Error frequency tracking',
            'Deployment correlation',
            'Root cause identification',
            'Evidence gathering',
          ],
        },
        {
          color: 'emerald',
          responsibilities: [
            'Remediation planning',
            'Rollback recommendations',
            'Risk assessment',
            'Recovery time estimation',
            'Resolution reporting',
          ],
        },
      ];
      return { ...a, ...extras[i] };
    });
    res.json({ data: agents });
  });

  return router;
};
