const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { getRepository } = require('./repositories/repositoryFactory');
const IncidentService = require('./services/incidentService');
const AgentOrchestrator = require('./services/agentOrchestrator');
const { getProvider } = require('./providers/providerFactory');
const healthRoutes = require('./routes/healthRoutes');
const createIncidentRoutes = require('./routes/incidentRoutes');
const createAgentRoutes = require('./routes/agentRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const errorHandler = require('./middleware/errorHandler');
const { seedDemoData } = require('./data/seedData');

async function start() {
  const app = express();

  // Middleware
  app.use(cors({ origin: config.NODE_ENV === 'production' ? undefined : '*' }));
  app.use(express.json());

  // Wire up services
  const repository = getRepository(config.DATA_MODE);
  const incidentService = new IncidentService(repository);
  const aiProvider = getProvider(config.AI_PROVIDER);
  const orchestrator = new AgentOrchestrator(incidentService, aiProvider);

  // Mount routes
  app.use('/api', healthRoutes);
  app.use('/api/incidents', createIncidentRoutes(incidentService, orchestrator));
  app.use('/api/agents', createAgentRoutes(orchestrator));
  app.use('/api/integrations', integrationRoutes);

  // Error handler
  app.use(errorHandler);

  // Seed demo data
  if (config.DEMO_MODE) {
    await seedDemoData(incidentService);
  }

  const PORT = config.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n  ⚡ SwitchAI server running on http://localhost:${PORT}`);
    console.log(`  📦 Data mode: ${config.DATA_MODE}`);
    console.log(`  🤖 AI provider: ${config.AI_PROVIDER}`);
    console.log(`  🔌 Switch: ${config.SWITCH_ENABLED ? 'enabled' : 'disabled (local demo)'}`);
    console.log(`  🎯 Demo mode: ${config.DEMO_MODE ? 'on' : 'off'}\n`);
  });

  return app;
}

// Export for testing
module.exports = { start };

// Auto-start when run directly
if (require.main === module) {
  start().catch(console.error);
}
