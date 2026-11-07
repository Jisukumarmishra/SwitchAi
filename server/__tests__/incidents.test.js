/* global describe, it, expect, beforeAll */
const request = require('supertest');
const express = require('express');
const cors = require('cors');
const MemoryRepository = require('../repositories/memoryRepository');
const IncidentService = require('../services/incidentService');
const AgentOrchestrator = require('../services/agentOrchestrator');
const MockAIProvider = require('../providers/mockAIProvider');
const healthRoutes = require('../routes/healthRoutes');
const createIncidentRoutes = require('../routes/incidentRoutes');
const createAgentRoutes = require('../routes/agentRoutes');
const integrationRoutes = require('../routes/integrationRoutes');
const errorHandler = require('../middleware/errorHandler');

let app;

beforeAll(() => {
  app = express();
  app.use(cors());
  app.use(express.json());

  const repo = new MemoryRepository();
  const incidentService = new IncidentService(repo);
  const provider = new MockAIProvider();
  const orchestrator = new AgentOrchestrator(incidentService, provider);

  app.use('/api', healthRoutes);
  app.use('/api/incidents', createIncidentRoutes(incidentService, orchestrator));
  app.use('/api/agents', createAgentRoutes(orchestrator));
  app.use('/api/integrations', integrationRoutes);
  app.use(errorHandler);
});

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/incidents', () => {
  it('creates an incident with valid data', async () => {
    const res = await request(app).post('/api/incidents').send({
      title: 'Test incident',
      description: 'Something broke',
      severity: 'high',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test incident');
    expect(res.body.data.status).toBe('reported');
    expect(res.body.data.id).toBeTruthy();
  });

  it('rejects missing title', async () => {
    const res = await request(app).post('/api/incidents').send({
      description: 'No title',
      severity: 'low',
    });
    expect(res.status).toBe(400);
  });

  it('rejects missing description', async () => {
    const res = await request(app).post('/api/incidents').send({
      title: 'Has title',
      severity: 'low',
    });
    expect(res.status).toBe(400);
  });

  it('rejects missing severity', async () => {
    const res = await request(app).post('/api/incidents').send({
      title: 'Has title',
      description: 'Has desc',
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/incidents', () => {
  it('returns array of incidents', async () => {
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('GET /api/incidents/:id', () => {
  it('returns incident by id', async () => {
    const list = await request(app).get('/api/incidents');
    const id = list.body.data[0].id;
    const res = await request(app).get(`/api/incidents/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/incidents/nonexistent-id');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/incidents/:id/run-workflow', () => {
  it('runs workflow and updates to awaiting_approval', async () => {
    const create = await request(app).post('/api/incidents').send({
      title: 'Workflow test',
      description: 'Testing workflow',
      severity: 'critical',
    });
    const id = create.body.data.id;

    const res = await request(app).post(`/api/incidents/${id}/run-workflow`);
    expect(res.status).toBe(200);

    const updated = await request(app).get(`/api/incidents/${id}`);
    expect(updated.body.data.status).toBe('awaiting_approval');
    expect(updated.body.data.agentFindings.triage).toBeTruthy();
    expect(updated.body.data.agentFindings.investigation).toBeTruthy();
    expect(updated.body.data.agentFindings.fix).toBeTruthy();
  });
});

describe('POST /api/incidents/:id/approve', () => {
  it('resolves an incident', async () => {
    const create = await request(app).post('/api/incidents').send({
      title: 'Approve test',
      description: 'Testing approval',
      severity: 'high',
    });
    const id = create.body.data.id;
    await request(app).post(`/api/incidents/${id}/run-workflow`);

    const res = await request(app).post(`/api/incidents/${id}/approve`).send({
      approvedBy: 'TestEngineer',
      comments: 'LGTM',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('resolved');
  });
});

describe('POST /api/incidents/:id/reject', () => {
  it('rejects an incident awaiting approval', async () => {
    const create = await request(app).post('/api/incidents').send({
      title: 'Reject test',
      description: 'Testing rejection',
      severity: 'medium',
    });
    const id = create.body.data.id;
    await request(app).post(`/api/incidents/${id}/run-workflow`);

    const res = await request(app).post(`/api/incidents/${id}/reject`).send({
      rejectedBy: 'Eng',
      reason: 'Need more info',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('rejected');
  });

  it('returns 400 when not awaiting approval', async () => {
    const create = await request(app).post('/api/incidents').send({
      title: 'Bad reject',
      description: 'Not ready',
      severity: 'low',
    });
    const res = await request(app).post(`/api/incidents/${create.body.data.id}/reject`);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/agents', () => {
  it('returns three agents', async () => {
    const res = await request(app).get('/api/agents');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(3);
  });
});

describe('GET /api/integrations/status', () => {
  it('returns integration status', async () => {
    const res = await request(app).get('/api/integrations/status');
    expect(res.status).toBe(200);
    expect(res.body.data.switch).toBeTruthy();
    expect(res.body.data.ai).toBeTruthy();
  });
});
