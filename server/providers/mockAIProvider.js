/**
 * Mock AI provider — returns realistic, agent-specific analysis
 * that simulates what a real DevOps-focused LLM would produce.
 *
 * Each call introduces a 1-2 s delay to mimic processing time.
 */
class MockAIProvider {
  constructor() {
    this.name = 'mock';
  }

  /**
   * @param {'triage'|'investigation'|'fix'} agentType
   * @param {object} incident
   * @returns {Promise<object>} Structured findings for the given agent.
   */
  async analyze(agentType, incident) {
    const delay = 1000 + Math.random() * 1000; // 1-2 s
    await new Promise((r) => setTimeout(r, delay));

    switch (agentType) {
      case 'triage':
        return this._triageResponse(incident);
      case 'investigation':
        return this._investigationResponse(incident);
      case 'fix':
        return this._fixResponse(incident);
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  }

  /* ================================================================== */
  /*  Triage mock                                                        */
  /* ================================================================== */
  _triageResponse(incident) {
    if (this._isMissingUserResponseBug(incident)) {
      return this._missingUserTriageResponse(incident);
    }

    return {
      classification: {
        type: 'deployment',
        subtype: 'post-deployment regression',
        confidence: 0.92,
        reasoning:
          'Error spike aligns precisely with the deployment window of checkout-service v2.14.0. ' +
          'The 0.1% → 23% error-rate jump within 15 minutes is characteristic of a code regression ' +
          'rather than an infrastructure issue. No corresponding infrastructure alerts were triggered.',
      },
      severityAssessment: {
        current: incident.severity || 'critical',
        recommended: 'critical',
        reasoning:
          'The checkout flow is a revenue-critical path. A 23% error rate directly impacts order ' +
          'completion and revenue. At current traffic (~4,200 req/min) this translates to roughly ' +
          '966 failed transactions per minute, an estimated $14,500/min in lost revenue.',
        impactScore: 9.2,
      },
      affectedServices: [
        {
          name: 'checkout-service',
          version: 'v2.14.0',
          status: 'degraded',
          errorRate: '23%',
        },
        {
          name: 'payment-gateway',
          version: 'v3.8.1',
          status: 'downstream-impact',
          errorRate: '18%',
        },
        {
          name: 'inventory-service',
          version: 'v1.22.3',
          status: 'healthy',
          errorRate: '0.3%',
        },
        {
          name: 'notification-service',
          version: 'v2.5.0',
          status: 'queue-backlog',
          errorRate: '0.1%',
        },
      ],
      priority: {
        level: 'P0',
        reasoning:
          'Revenue-impacting production outage on a Tier-1 service with >20% error rate. ' +
          'Meets P0 criteria: customer-facing, revenue impact, and widening blast radius.',
      },
      recommendations: [
        'Immediately page the checkout-service on-call engineer',
        'Consider rolling back checkout-service to v2.13.2 if root cause is not identified within 15 minutes',
        'Enable enhanced logging on POST /api/checkout and POST /api/payments/process',
        'Notify customer-support team of potential increase in checkout failure complaints',
        'Open a bridge call with checkout-service, payment-gateway, and SRE teams',
      ],
    };
  }

  /* ================================================================== */
  /*  Investigation mock                                                 */
  /* ================================================================== */
  _investigationResponse(incident) {
    if (this._isMissingUserResponseBug(incident)) {
      return this._missingUserInvestigationResponse(incident);
    }

    return {
      logAnalysis: {
        totalEntriesAnalyzed: 24817,
        timeRange: {
          start: '2026-11-06T08:42:00Z',
          end: '2026-11-06T09:15:00Z',
        },
        errorCount: 5704,
        warningCount: 1289,
        summary:
          'Analysis of 24,817 log entries from checkout-service reveals a NullPointerException ' +
          'originating in PaymentTokenValidator.validate() introduced in commit a3f8c91. The error ' +
          'is triggered when the optional field `billingAddress.stateCode` is null, which occurs for ' +
          'international orders (~23% of checkout traffic).',
      },
      errorPatterns: [
        {
          pattern: 'java.lang.NullPointerException: PaymentTokenValidator.validate()',
          frequency: 4892,
          firstSeen: '2026-11-06T08:45:12Z',
          lastSeen: '2026-11-06T09:14:58Z',
          sampleTrace:
            'at com.switchai.checkout.validation.PaymentTokenValidator.validate(PaymentTokenValidator.java:87)\n' +
            'at com.switchai.checkout.service.CheckoutService.processOrder(CheckoutService.java:142)\n' +
            'at com.switchai.checkout.controller.CheckoutController.handlePost(CheckoutController.java:58)',
        },
        {
          pattern: 'ConnectionTimeoutException: payment-gateway:8443 — connect timed out after 5000ms',
          frequency: 812,
          firstSeen: '2026-11-06T08:52:30Z',
          lastSeen: '2026-11-06T09:14:44Z',
          sampleTrace:
            'at com.switchai.checkout.client.PaymentGatewayClient.charge(PaymentGatewayClient.java:63)\n' +
            'at com.switchai.checkout.service.PaymentService.processPayment(PaymentService.java:95)',
        },
      ],
      deploymentCorrelation: {
        deploymentId: 'deploy-2026-1106-0840',
        version: 'v2.14.0',
        deployedAt: '2026-11-06T08:40:00Z',
        deployer: 'ci-pipeline / jenkins-prod-checkout',
        errorsBeforeDeployment: 12,
        errorsAfterDeployment: 5704,
        correlationStrength: 'strong',
        suspiciousCommits: [
          {
            hash: 'a3f8c91',
            author: 'dev-team',
            message: 'refactor: streamline PaymentTokenValidator null-handling',
            filesChanged: [
              'PaymentTokenValidator.java',
              'CheckoutService.java',
            ],
          },
        ],
      },
      rootCauses: [
        {
          id: 'RC-001',
          description:
            'PaymentTokenValidator.validate() assumes billingAddress.stateCode is non-null after ' +
            'the refactor in commit a3f8c91. International orders (23% of traffic) do not include ' +
            'this field, causing a NullPointerException.',
          confidence: 0.95,
          evidence: [
            'Error stack traces point to PaymentTokenValidator.java:87',
            'Error rate matches international-order traffic ratio (23%)',
            'v2.13.2 had an explicit null-check on stateCode; v2.14.0 removed it',
          ],
        },
        {
          id: 'RC-002',
          description:
            'Cascading connection-pool exhaustion on payment-gateway caused by retry storms from ' +
            'failing checkout requests.',
          confidence: 0.78,
          evidence: [
            'ConnectionTimeoutExceptions appeared ~7 min after the first NPE spike',
            'payment-gateway connection-pool utilisation hit 100% at 08:52 UTC',
            'Retry policy is set to 3 attempts with no backoff',
          ],
        },
      ],
      evidence: {
        logSnippets: [
          '[2026-11-06T08:45:12.334Z] ERROR checkout-service — NullPointerException in PaymentTokenValidator.validate() — orderId=ORD-88412 billingAddress.stateCode=null',
          '[2026-11-06T08:52:30.891Z] WARN  checkout-service — ConnectionTimeoutException: payment-gateway:8443 connect timed out (attempt 3/3) — orderId=ORD-88523',
          '[2026-11-06T08:55:01.204Z] ERROR payment-gateway — Connection pool exhausted: active=200/200 pending=347',
        ],
        metrics: {
          errorRateBefore: '0.1%',
          errorRateAfter: '23%',
          p99LatencyBefore: '320ms',
          p99LatencyAfter: '8400ms',
        },
      },
    };
  }

  /* ================================================================== */
  /*  Fix & Release mock                                                 */
  /* ================================================================== */
  _fixResponse(incident) {
    if (this._isMissingUserResponseBug(incident)) {
      return this._missingUserFixResponse(incident);
    }

    return {
      remediationPlan: {
        summary:
          'Apply a targeted hotfix to restore the null-check in PaymentTokenValidator, then ' +
          'deploy as v2.14.1. Follow with connection-pool tuning on payment-gateway.',
        steps: [
          {
            order: 1,
            action: 'Add null-safety check for billingAddress.stateCode in PaymentTokenValidator.validate()',
            assignee: 'checkout-service team',
            estimatedMinutes: 15,
            details:
              'Restore the stateCode null-check removed in commit a3f8c91. Add unit tests for ' +
              'null stateCode (international orders) and empty-string stateCode.',
          },
          {
            order: 2,
            action: 'Run full checkout integration test suite',
            assignee: 'QA / CI pipeline',
            estimatedMinutes: 10,
            details: 'Execute test suites: checkout-unit, checkout-integration, payment-e2e.',
          },
          {
            order: 3,
            action: 'Deploy hotfix v2.14.1 via canary (5% → 25% → 100%)',
            assignee: 'SRE team',
            estimatedMinutes: 20,
            details:
              'Use the standard canary pipeline. Gate each stage on error-rate < 0.5% for 3 min.',
          },
          {
            order: 4,
            action: 'Tune payment-gateway connection pool: increase max from 200 to 350, add exponential backoff to retry policy',
            assignee: 'payment-gateway team',
            estimatedMinutes: 15,
            details:
              'Update application.yml: pool.maxActive=350, retry.backoff=exponential(500ms, 2x, max=8s).',
          },
          {
            order: 5,
            action: 'Monitor dashboards for 30 minutes post-deploy',
            assignee: 'SRE on-call',
            estimatedMinutes: 30,
            details: 'Watch: checkout error rate, p99 latency, payment-gateway pool utilisation.',
          },
        ],
      },
      rollbackPlan: {
        trigger: 'Error rate exceeds 1% within 5 minutes of any canary stage',
        steps: [
          {
            order: 1,
            action: 'Halt canary deployment immediately',
            estimatedMinutes: 1,
          },
          {
            order: 2,
            action: 'Roll back checkout-service to v2.13.2 using `kubectl rollout undo deployment/checkout-service`',
            estimatedMinutes: 3,
          },
          {
            order: 3,
            action: 'Restart payment-gateway pods to clear exhausted connection pools',
            estimatedMinutes: 2,
          },
          {
            order: 4,
            action: 'Verify error rate returns to baseline (<0.2%) and p99 latency <500ms',
            estimatedMinutes: 5,
          },
        ],
      },
      riskAssessment: {
        level: 'medium',
        factors: [
          'Hotfix touches validation logic on a revenue-critical path',
          'Connection-pool changes on payment-gateway could affect other consumers',
          'Canary deployment reduces blast radius but adds latency to full rollout',
        ],
        mitigations: [
          'Canary deployment with automated error-rate gating',
          'Comprehensive integration tests before deploy',
          'Rollback plan tested and ready — v2.13.2 known-good image is still cached',
          'Payment-gateway pool change is backward-compatible and non-breaking',
        ],
      },
      estimatedRecoveryTime: '60-90 minutes',
      recommendation:
        'Proceed with the hotfix deployment (v2.14.1) via canary. The root cause is well understood ' +
        'and the fix is minimal (single null-check restoration). Risk is mitigated by canary gating ' +
        'and a pre-tested rollback plan. Estimated full recovery within 90 minutes.',
    };
  }

  _isMissingUserResponseBug(incident) {
    const report = [incident.title, incident.description, ...(incident.logs || [])]
      .filter(Boolean)
      .join('\n')
      .toLowerCase();
    return /\/api\/users?\//.test(report) && /500/.test(report) && /404/.test(report);
  }

  _missingUserTriageResponse(incident) {
    const severity = incident.severity || 'medium';
    const service = incident.affectedService || 'user API';
    const priority = severity === 'critical' ? 'P0' : severity === 'high' ? 'P1' : 'P2';
    return {
      classification: {
        type: 'application bug',
        subtype: 'missing-resource HTTP status handling',
        confidence: 0.88,
        reasoning: 'The report says a missing user produces HTTP 500 while HTTP 404 is expected. No repository or runtime trace was provided, so the code path still needs inspection.',
      },
      severityAssessment: {
        current: severity,
        recommended: severity,
        reasoning: 'Severity follows the submitted report; traffic volume and customer impact metrics were not provided.',
        impactScore: severity === 'critical' ? 9 : severity === 'high' ? 7 : 4,
      },
      affectedServices: [{ name: service, status: 'reported failure', errorRate: 'not provided' }],
      priority: {
        level: priority,
        reasoning: 'The request fails for missing users. The report does not include enough impact data to claim a production-wide outage.',
      },
      recommendations: [
        'Inspect the user lookup and exception-to-HTTP mapping for GET /api/users/:id',
        'Add regression coverage for both an existing user (200) and a missing user (404)',
        'Keep any proposed source change on a separate branch for human review',
      ],
    };
  }

  _missingUserInvestigationResponse(incident) {
    const logs = Array.isArray(incident.logs) ? incident.logs : [];
    const errors = logs.filter((line) => /error|exception|fatal/i.test(line));
    const warnings = logs.filter((line) => /warn/i.test(line));
    const pattern = errors[0];
    return {
      logAnalysis: {
        totalEntriesAnalyzed: logs.length,
        timeRange: null,
        errorCount: errors.length,
        warningCount: warnings.length,
        summary: logs.length
          ? `Reviewed ${logs.length} supplied log line(s). ${errors.length} matched an error pattern. These samples do not identify a verified source-code cause.`
          : 'No application logs were attached, so log-based error detection could not be performed.',
      },
      errorPatterns: pattern ? [{ pattern, frequency: errors.filter((line) => line === pattern).length }] : [],
      deploymentCorrelation: {
        deploymentId: null,
        version: null,
        deployedAt: null,
        correlationStrength: 'not provided',
        suspiciousCommits: [],
      },
      rootCauses: [{
        id: 'HYP-001',
        description: 'Hypothesis only: the missing-user result may raise an unhandled exception instead of being mapped to HTTP 404. Confirm this by inspecting the endpoint and service code.',
        confidence: 0.55,
        evidence: [
          'The report states that a missing user returns HTTP 500 and expects HTTP 404.',
          ...(logs.length ? [`${logs.length} log line(s) were supplied; they have not been matched to repository source.`] : ['No log samples or repository source were supplied.']),
        ],
      }],
      evidence: { logSnippets: logs, metrics: {} },
    };
  }

  _missingUserFixResponse(incident) {
    return {
      remediationPlan: {
        summary: 'Proposed next step: inspect the user lookup and map a missing record to HTTP 404, then cover the behavior with regression tests. No source files were inspected or changed by this local demo.',
        steps: [
          { order: 1, action: 'Inspect the GET /api/users/:id handler and not-found path', assignee: 'Developer', estimatedMinutes: 15, details: 'Verify where the missing-user case becomes an exception.' },
          { order: 2, action: 'Add tests for existing user → 200 and missing user → 404', assignee: 'Developer', estimatedMinutes: 15, details: 'Use the project test framework and keep the missing-user case as a regression test.' },
          { order: 3, action: 'Propose the smallest fix on a separate branch for review', assignee: 'Developer', estimatedMinutes: 20, details: 'The local demo does not edit files, run repository tests, or create a pull request.' },
        ],
      },
      rollbackPlan: {
        trigger: 'A proposed code change fails tests or review identifies a regression.',
        steps: [{ order: 1, action: 'Revert the proposed branch or pull request after human review; no production action is run by this demo.', estimatedMinutes: 5 }],
      },
      riskAssessment: {
        level: 'medium',
        factors: ['The code path and error handling have not been inspected.', 'The report contains no test output or deployment evidence.'],
        mitigations: ['Confirm the source-level cause before changing code.', 'Run regression tests and require human review before merge.'],
      },
      estimatedRecoveryTime: 'Not estimated — source code and test results are unavailable',
      recommendation: 'Treat this as an investigation plan only. Verify the missing-user path in the repository, implement and test a fix on a branch, then request human review.',
    };
  }
}

module.exports = MockAIProvider;
