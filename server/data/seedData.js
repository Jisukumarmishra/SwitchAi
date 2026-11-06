const { createIncident } = require('../models/Incident');

/**
 * Creates and seeds a realistic demo incident.
 *
 * @param {import('../services/incidentService')} incidentService
 * @returns {Promise<object>} The seeded incident.
 */
async function seedDemoData(incidentService) {
  const incident = await incidentService.create({
    title: 'Checkout API returning HTTP 500 errors',
    description:
      'The checkout service started returning HTTP 500 errors shortly after deployment v2.14.0. ' +
      'Error rate increased from 0.1% to 23% within 15 minutes. Affected endpoints: ' +
      'POST /api/checkout, POST /api/payments/process.',
    severity: 'critical',
    affectedService: 'checkout-service',
    environment: 'production',
    logs: [
      '[2026-11-06T08:40:05Z] INFO  deploy-agent — Deployment checkout-service v2.14.0 started (deploy-2026-1106-0840)',
      '[2026-11-06T08:42:18Z] INFO  deploy-agent — Deployment checkout-service v2.14.0 completed successfully. 4/4 pods healthy.',
      '[2026-11-06T08:45:12Z] ERROR checkout-service — java.lang.NullPointerException: Cannot invoke method on null reference\n  at com.switchai.checkout.validation.PaymentTokenValidator.validate(PaymentTokenValidator.java:87)\n  at com.switchai.checkout.service.CheckoutService.processOrder(CheckoutService.java:142)',
      '[2026-11-06T08:45:14Z] ERROR checkout-service — HTTP 500 returned for POST /api/checkout — orderId=ORD-88412 userId=USR-44201',
      '[2026-11-06T08:46:01Z] WARN  monitoring — checkout-service error rate crossed 5% threshold (current: 7.2%)',
      '[2026-11-06T08:48:33Z] ERROR checkout-service — java.lang.NullPointerException: PaymentTokenValidator.validate() — billingAddress.stateCode is null — orderId=ORD-88467',
      '[2026-11-06T08:50:00Z] WARN  monitoring — checkout-service error rate crossed 10% threshold (current: 12.8%)',
      '[2026-11-06T08:52:30Z] ERROR checkout-service — ConnectionTimeoutException: payment-gateway:8443 — connect timed out after 5000ms (attempt 3/3) — orderId=ORD-88523',
      '[2026-11-06T08:55:01Z] ERROR payment-gateway — Connection pool exhausted: active=200/200 pending=347',
      '[2026-11-06T08:57:15Z] WARN  monitoring — checkout-service error rate crossed 20% threshold (current: 23.1%)',
      '[2026-11-06T08:58:00Z] INFO  pagerduty — Alert fired: checkout-service P0 incident — on-call notified',
    ],
  });

  console.log(`[seed] Demo incident created: ${incident.id} — "${incident.title}"`);
  return incident;
}

module.exports = { seedDemoData };
