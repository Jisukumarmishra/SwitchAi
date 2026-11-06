const { Router } = require('express');

const router = Router();

/**
 * Incident routes factory — receives shared services.
 */
module.exports = function createIncidentRoutes(incidentService, orchestrator) {
  // GET /api/incidents
  router.get('/', async (_req, res, next) => {
    try {
      const incidents = await incidentService.getAll();
      res.json({ data: incidents });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/incidents
  router.post('/', async (req, res, next) => {
    try {
      const { title, description, severity, affectedService, environment, logs } = req.body;
      if (!title || !description || !severity) {
        return res.status(400).json({ error: 'title, description, and severity are required.' });
      }
      const incident = await incidentService.create({
        title,
        description,
        severity,
        affectedService: affectedService || '',
        environment: environment || 'production',
        logs: Array.isArray(logs) ? logs : logs ? [logs] : [],
      });
      res.status(201).json({ data: incident });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/incidents/:id
  router.get('/:id', async (req, res, next) => {
    try {
      const incident = await incidentService.getById(req.params.id);
      res.json({ data: incident });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/incidents/:id/run-workflow  (SSE)
  router.post('/:id/run-workflow', async (req, res, next) => {
    try {
      const incident = await incidentService.getById(req.params.id);

      // Set SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.flushHeaders();

      // Listen for orchestrator events
      const listener = (event) => {
        if (event.incidentId === req.params.id) {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }
      };
      orchestrator.on('incident_event', listener);

      req.on('close', () => {
        orchestrator.removeListener('incident_event', listener);
      });

      // Run workflow (non-blocking for SSE)
      orchestrator
        .runWorkflow(req.params.id)
        .then((updated) => {
          res.write(`data: ${JSON.stringify({ type: 'workflow_finished', data: { incident: updated } })}\n\n`);
          res.end();
        })
        .catch((err) => {
          res.write(`data: ${JSON.stringify({ type: 'workflow_error', data: { error: err.message } })}\n\n`);
          res.end();
        });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/incidents/:id/events (SSE — live event stream)
  router.get('/:id/events', async (req, res, next) => {
    try {
      await incidentService.getById(req.params.id);

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      res.flushHeaders();
      res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

      const listener = (event) => {
        if (event.incidentId === req.params.id) {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }
      };
      orchestrator.on('incident_event', listener);
      req.on('close', () => orchestrator.removeListener('incident_event', listener));
    } catch (err) {
      next(err);
    }
  });

  // POST /api/incidents/:id/approve
  router.post('/:id/approve', async (req, res, next) => {
    try {
      const incident = await incidentService.getById(req.params.id);
      if (incident.status !== 'awaiting_approval') {
        return res.status(400).json({ error: `Incident is not awaiting approval (current: ${incident.status}).` });
      }
      const { approvedBy, comments } = req.body;
      await incidentService.setHumanApproval(req.params.id, {
        status: 'approved',
        approvedBy: approvedBy || 'Anonymous',
        comments: comments || '',
      });
      await incidentService.addTimelineEvent(req.params.id, {
        event: 'Human approved remediation plan',
        actor: approvedBy || 'Anonymous',
        details: comments || 'Approved without comments.',
      });

      // Simulate safe action
      await incidentService.addTimelineEvent(req.params.id, {
        event: '[SIMULATED] Rollback to v2.13.2 executed successfully',
        actor: 'system',
        details: 'Demo mode — no real deployment actions were performed.',
      });

      const resolved = await incidentService.resolve(req.params.id, {
        summary: 'Incident resolved via approved rollback to v2.13.2. Root cause: NullPointerException in PaymentTokenValidator.validate() introduced in v2.14.0.',
        resolvedBy: approvedBy || 'Anonymous',
        actionTaken: 'Simulated rollback to checkout-service v2.13.2',
      });
      res.json({ data: resolved });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/incidents/:id/reject
  router.post('/:id/reject', async (req, res, next) => {
    try {
      const incident = await incidentService.getById(req.params.id);
      if (incident.status !== 'awaiting_approval') {
        return res.status(400).json({ error: `Incident is not awaiting approval (current: ${incident.status}).` });
      }
      const { rejectedBy, reason } = req.body;
      await incidentService.setHumanApproval(req.params.id, {
        status: 'rejected',
        approvedBy: rejectedBy || 'Anonymous',
        comments: reason || '',
      });
      await incidentService.update(req.params.id, { status: 'rejected' });
      await incidentService.addTimelineEvent(req.params.id, {
        event: 'Human rejected remediation plan',
        actor: rejectedBy || 'Anonymous',
        details: reason || 'Rejected without reason.',
      });
      const updated = await incidentService.getById(req.params.id);
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
