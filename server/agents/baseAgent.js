/**
 * Base class for all AI agents in the SwitchAI pipeline.
 * Subclasses must override analyze() and generateResponse().
 */
class BaseAgent {
  /**
   * @param {object} opts
   * @param {string} opts.name    - Human-readable agent name.
   * @param {string} opts.role    - Short description of the agent's responsibility.
   * @param {object} opts.provider - AI provider instance (e.g. MockAIProvider).
   */
  constructor({ name, role, provider }) {
    this.name = name;
    this.role = role;
    this.provider = provider;
    this.status = 'idle'; // idle | running | completed | error
  }

  /**
   * Run the full agent lifecycle: analyse then respond.
   *
   * @param {object} incident - The incident record.
   * @param {object} context  - Any extra context (previous agent findings, etc.).
   * @returns {Promise<object>} Structured findings.
   */
  async run(incident, context = {}) {
    this.status = 'running';
    try {
      const analysis = await this.analyze(incident, context);
      const findings = await this.generateResponse(incident, analysis);
      this.status = 'completed';
      return findings;
    } catch (err) {
      this.status = 'error';
      throw err;
    }
  }

  /**
   * Analyse the incident. Must be overridden by subclasses.
   */
  async analyze(_incident, _context) {
    throw new Error(`${this.name}: analyze() not implemented`);
  }

  /**
   * Produce structured findings from raw analysis. Must be overridden.
   */
  async generateResponse(_incident, _analysis) {
    throw new Error(`${this.name}: generateResponse() not implemented`);
  }

  /**
   * Serialise agent metadata for the /api/agents endpoint.
   */
  toJSON() {
    return {
      name: this.name,
      role: this.role,
      status: this.status,
    };
  }
}

module.exports = BaseAgent;
