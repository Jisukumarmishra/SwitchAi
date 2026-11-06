const BaseAgent = require('./baseAgent');

/**
 * Investigation Agent — deep-dive analyst.
 *
 * Responsibilities:
 *  - Analyse logs for error patterns
 *  - Detect recurring errors with frequency
 *  - Correlate errors with the deployment timeline
 *  - Identify potential root causes with confidence levels
 *  - Gather supporting evidence
 */
class InvestigationAgent extends BaseAgent {
  constructor(provider) {
    super({
      name: 'Investigation Agent',
      role: 'Performs deep log analysis and root-cause investigation',
      provider,
    });
  }

  async analyze(incident, _context) {
    return this.provider.analyze('investigation', incident);
  }

  async generateResponse(_incident, analysis) {
    return analysis;
  }
}

module.exports = InvestigationAgent;
