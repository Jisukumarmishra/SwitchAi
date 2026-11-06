# SwitchAI Demo Guide

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Setup (2 minutes)

```bash
# Clone and enter the project
git clone https://github.com/Jisukumarmishra/SwitchAi.git
cd SwitchAi

# Copy environment file
cp .env.example .env

# Install dependencies
cd server && npm install
cd ../client && npm install
```

### Run (30 seconds)

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open http://localhost:5173

## Demo Walkthrough

### For Hackathon Judges (5-minute script)

#### 1. Dashboard Overview (30 seconds)

> "SwitchAI is an AI-powered DevOps incident response platform where multiple AI agents collaborate with human developers to resolve production incidents."

Show the dashboard with stats cards, agent status, and recent activity.

#### 2. Create an Incident (30 seconds)

Navigate to **Incidents** → Click **Create Incident**

Enter:
- **Title:** "Checkout API returning HTTP 500 errors"
- **Description:** "The checkout service started returning HTTP 500 errors after deployment v2.14.0. Error rate spiked from 0.1% to 23%."
- **Severity:** Critical
- **Service:** checkout-service
- **Environment:** Production

Or use the pre-seeded demo incident.

#### 3. Run the AI Workflow (2 minutes)

Click into the incident → Click **"Run AI Incident Workflow"**

Watch in real-time as:

1. **Triage Agent** (violet) classifies the incident
   - "This is a deployment-related incident affecting the checkout-service..."
   - Assigns critical severity with reasoning

2. **Investigation Agent** (cyan) analyzes logs
   - "Found recurring NullPointerException in PaymentProcessor.java..."
   - "Error pattern correlates with deployment v2.14.0 at 14:23 UTC..."
   - Identifies root cause with confidence level

3. **Fix & Release Agent** (green) recommends action
   - "Recommended: Rollback to v2.13.2..."
   - "Risk: Low — previous version was stable for 14 days..."
   - Provides step-by-step remediation plan

#### 4. Human Approval (30 seconds)

> "The AI agents don't act autonomously on production systems. A human must review and approve."

- Review the proposed solution
- Add a comment: "Approved — proceed with rollback"
- Click **Approve**

Watch the resolution timeline update.

#### 5. Team Room (30 seconds)

Navigate to **Team Room**

> "All agent communications and human decisions are captured in a shared collaboration space — designed to connect with Switch as the central communication layer."

Show how messages from different agents and humans appear chronologically.

#### 6. Integration Architecture (30 seconds)

Navigate to **Settings**

> "The platform is built with a pluggable integration architecture. Switch integration is prepared — when enabled, agents will communicate through Switch rooms, making this a true multi-party collaboration tool."

Show the integration status cards.

### Key Talking Points

- **Not a chatbot** — This is a multi-agent collaboration platform
- **Human-in-the-loop** — AI suggests, humans approve
- **Switch-ready** — Architecture prepared for Switch as the communication hub
- **Real workflow** — Complete incident lifecycle from report to resolution
- **Specialized agents** — Each agent has distinct expertise and produces different analysis
- **Production-safe** — All actions are simulated; no real deployments affected

## Repeating the Demo

The demo is fully repeatable:

1. Create a new incident (or use the seeded one)
2. Run the workflow
3. Approve or reject
4. Check the resolution

Each run creates fresh timeline events and agent findings.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check that `.env` exists (copy from `.env.example`) |
| Frontend can't reach API | Ensure backend is running on port 5000 |
| Empty dashboard | Make sure `DEMO_MODE=true` in `.env` |
| Workflow doesn't run | Check backend console for errors |
