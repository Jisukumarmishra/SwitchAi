const { v4: uuidv4 } = require('uuid');

const SEVERITIES = ['critical', 'high', 'medium', 'low'];
const STATUSES = [
  'reported',
  'triaging',
  'investigating',
  'fixing',
  'awaiting_approval',
  'approved',
  'rejected',
  'resolved',
];

/**
 * Factory function that creates a new Incident object.
 *
 * @param {object} data - Partial incident data supplied by the caller.
 * @returns {object} A fully-formed incident record.
 */
function createIncident(data = {}) {
  const now = new Date().toISOString();

  return {
    id: data.id || uuidv4(),
    title: data.title || '',
    description: data.description || '',
    severity: SEVERITIES.includes(data.severity) ? data.severity : 'medium',
    status: STATUSES.includes(data.status) ? data.status : 'reported',
    affectedService: data.affectedService || '',
    environment: data.environment || 'production',
    logs: data.logs || [],
    timeline: data.timeline || [],
    agentFindings: data.agentFindings || {
      triage: null,
      investigation: null,
      fix: null,
    },
    humanApproval: data.humanApproval || {
      status: 'pending',
      approvedBy: null,
      timestamp: null,
      comments: null,
    },
    resolution: data.resolution || {
      summary: null,
      resolvedAt: null,
      resolvedBy: null,
      actionTaken: null,
    },
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
  };
}

module.exports = { createIncident, SEVERITIES, STATUSES };
