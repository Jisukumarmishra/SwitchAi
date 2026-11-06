const { EventEmitter } = require('events');
const TriageAgent = require('../agents/triageAgent');
const InvestigationAgent = require('../agents/investigationAgent');
const FixReleaseAgent = require('../agents/fixReleaseAgent');

/**
 * Orchestrates the three-agent workflow:
 *   triage  →  investigation  →  fix & release
 *
 * Emits events for SSE streaming.
 */
class AgentOrchestrator extends EventEmitter {
  /**
   * @param {import('./incidentService')} incidentService
   * @param {import('../providers/mockAIProvider')} aiProvider
   */
  constructor(incidentService, aiProvider) {
    super();
    this.incidentService = incidentService;
    this.aiProvider = aiProvider;

    this.triageAgent = new TriageAgent(aiProvider);
    this.investigationAgent = new InvestigationAgent(aiProvider);
    this.fixReleaseAgent = new FixReleaseAgent(aiProvider);
  }

  /**
   * Return metadata about the registered agents.
   */
  getAgents() {
    return [
      this.triageAgent.toJSON(),
      this.investigationAgent.toJSON(),
      this.fixReleaseAgent.toJSON(),
    ];
  }

  /**
   * Execute the full workflow for the given incident.
   *
   * @param {string} incidentId
   * @returns {Promise<object>} The fully-updated incident.
   */
  async runWorkflow(incidentId) {
    const agents = [
      { agent: this.triageAgent, key: 'triage', status: 'triaging' },
      { agent: this.investigationAgent, key: 'investigation', status: 'investigating' },
      { agent: this.fixReleaseAgent, key: 'fix', status: 'fixing' },
    ];

    let incident = await this.incidentService.getById(incidentId);

    this._emit(incidentId, 'workflow_started', {
      message: 'AI agent workflow initiated',
      incidentId,
    });

    for (const { agent, key, status } of agents) {
      try {
        // 1. Update incident status
        incident = await this.incidentService.update(incidentId, { status });

        // 2. Timeline: agent started
        const startMsg = `${agent.name} started analysis of incident`;
        await this.incidentService.addTimelineEvent(incidentId, {
          event: startMsg,
          actor: agent.name,
          details: `Role: ${agent.role}`,
        });
        this._emit(incidentId, 'agent_started', {
          agent: agent.name,
          role: agent.role,
          phase: key,
        });

        // 3. Run agent analysis
        const findings = await agent.run(incident);

        // 4. Store findings
        incident = await this.incidentService.setAgentFindings(incidentId, key, findings);

        // 5. Timeline: agent completed
        const summary = this._summarizeFindings(key, findings);
        await this.incidentService.addTimelineEvent(incidentId, {
          event: `${agent.name} completed analysis`,
          actor: agent.name,
          details: summary,
        });
        this._emit(incidentId, 'agent_completed', {
          agent: agent.name,
          phase: key,
          summary,
        });
      } catch (err) {
        // Record error but continue with the next agent
        const errMsg = `${agent.name} encountered an error: ${err.message}`;
        await this.incidentService.addTimelineEvent(incidentId, {
          event: errMsg,
          actor: agent.name,
          details: err.stack || err.message,
        });
        this._emit(incidentId, 'agent_error', {
          agent: agent.name,
          phase: key,
          error: err.message,
        });
      }
    }

    // After all agents, move to awaiting_approval
    incident = await this.incidentService.update(incidentId, {
      status: 'awaiting_approval',
    });
    await this.incidentService.addTimelineEvent(incidentId, {
      event: 'All agents completed — awaiting human review and approval',
      actor: 'system',
      details:
        'The AI agent pipeline has finished. A human operator must review the findings and approve or reject the remediation plan.',
    });
    this._emit(incidentId, 'workflow_completed', {
      message: 'All agents completed. Awaiting human approval.',
      incidentId,
    });

    return this.incidentService.getById(incidentId);
  }

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */

  _emit(incidentId, type, data) {
    this.emit('incident_event', { incidentId, type, data, timestamp: new Date().toISOString() });
  }

  _summarizeFindings(key, findings) {
    switch (key) {
      case 'triage':
        return (
          `Classification: ${findings.classification?.type || 'N/A'} | ` +
          `Priority: ${findings.priority?.level || 'N/A'} | ` +
          `Severity recommendation: ${findings.severityAssessment?.recommended || 'N/A'}`
        );
      case 'investigation':
        return (
          `Root causes identified: ${findings.rootCauses?.length || 0} | ` +
          `Error patterns found: ${findings.errorPatterns?.length || 0} | ` +
          `Deployment correlation: ${findings.deploymentCorrelation?.correlationStrength || 'N/A'}`
        );
      case 'fix':
        return (
          `Remediation steps: ${findings.remediationPlan?.steps?.length || 0} | ` +
          `Risk level: ${findings.riskAssessment?.level || 'N/A'} | ` +
          `Est. recovery: ${findings.estimatedRecoveryTime || 'N/A'}`
        );
      default:
        return JSON.stringify(findings).slice(0, 200);
    }
  }
}

module.exports = AgentOrchestrator;
