const { createIncident } = require('../models/Incident');

/**
 * Business-logic layer that sits between routes and the repository.
 */
class IncidentService {
  /**
   * @param {import('../repositories/memoryRepository')} repository
   */
  constructor(repository) {
    this.repo = repository;
  }

  async create(data) {
    const incident = createIncident(data);
    incident.timeline.push({
      timestamp: new Date().toISOString(),
      event: 'Incident reported',
      actor: 'system',
      details: `Severity: ${incident.severity} | Service: ${incident.affectedService || 'N/A'}`,
    });
    return this.repo.create(incident);
  }

  async getAll() {
    return this.repo.findAll();
  }

  async getById(id) {
    const incident = await this.repo.findById(id);
    if (!incident) {
      const err = new Error(`Incident ${id} not found`);
      err.statusCode = 404;
      throw err;
    }
    return incident;
  }

  async update(id, updates) {
    const updated = await this.repo.update(id, updates);
    if (!updated) {
      const err = new Error(`Incident ${id} not found`);
      err.statusCode = 404;
      throw err;
    }
    return updated;
  }

  async addTimelineEvent(id, event) {
    const incident = await this.getById(id);
    const timeline = [...incident.timeline, { timestamp: new Date().toISOString(), ...event }];
    return this.repo.update(id, { timeline });
  }

  async setAgentFindings(id, agentKey, findings) {
    const incident = await this.getById(id);
    const agentFindings = {
      ...incident.agentFindings,
      [agentKey]: findings,
    };
    return this.repo.update(id, { agentFindings });
  }

  async setHumanApproval(id, approvalData) {
    return this.repo.update(id, {
      humanApproval: {
        ...approvalData,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async resolve(id, resolutionData) {
    const incident = await this.getById(id);
    const resolution = {
      ...resolutionData,
      resolvedAt: new Date().toISOString(),
    };
    const timeline = [
      ...incident.timeline,
      {
        timestamp: new Date().toISOString(),
        event: 'Incident resolved',
        actor: resolutionData.resolvedBy || 'system',
        details: resolutionData.summary || '',
      },
    ];
    return this.repo.update(id, { status: 'resolved', resolution, timeline });
  }
}

module.exports = IncidentService;
