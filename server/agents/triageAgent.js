const BaseAgent = require('./baseAgent');

/**
 * Triage Agent — first responder in the incident pipeline.
 *
 * Responsibilities:
 *  - Classify the incident type
 *  - Assess severity with reasoning
 *  - Identify affected services & dependencies
 *  - Assign priority
 *  - Provide initial recommendations
 */
class TriageAgent extends BaseAgent {
  constructor(provider) {
    super({
      name: 'Triage Agent',
      role: 'Classifies, prioritises, and routes incoming incidents',
      provider,
    });
  }

  async analyze(incident, _context) {
    return this.provider.analyze('triage', incident);
  }

  async generateResponse(_incident, analysis) {
    return analysis;
  }
}

module.exports = TriageAgent;
