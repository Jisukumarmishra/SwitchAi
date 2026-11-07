# SwitchAI

SwitchAI is a chat-first local demo for coordinating incident response with three specialized agents. A developer submits a bug report, the backend runs triage, investigation, and remediation planning in order, and the activity appears in the chat history for human review.

> **Integration status:** This repository does not currently connect to a live Switch service or Mattermost room. The default workflow uses a local mock provider and an in-process adapter. Do not describe the agents as connected to a real Switch room unless that integration is implemented and tested.

## What the demo does

1. A developer submits a bug report in the Team Chat page.
2. The backend creates an incident and runs the agents sequentially.
3. Each agent's findings and workflow events are attached to the incident history.
4. The workflow stops at `awaiting_approval` for human review.

The example user API report is tailored to the submitted text. It can identify a likely missing-resource status-handling issue, but it does not inspect source code, edit files, execute project tests, create a Git branch, or open a pull request.

## Agents and context handoff

| Agent | Local responsibility | Findings saved to |
| --- | --- | --- |
| Triage Agent | Classifies the report, assesses its stated severity, and identifies the service | `incident.agentFindings.triage` |
| Investigation Agent | Reviews supplied logs and reports whether deployment evidence is available | `incident.agentFindings.investigation` |
| Fix & Release Agent | Proposes a remediation and risk assessment for human review | `incident.agentFindings.fix` |

The orchestrator passes the updated incident record to each next step. This carries prior findings forward, but the current mock agents do not reliably use those findings as reasoning context. The agents do not communicate directly with one another.

## How Switch is used in this checkout

Switch integration is **scaffolded, not live**:

- `getSwitchAdapter()` selects `LocalDemoAdapter` when `SWITCH_ENABLED=false`.
- The local adapter creates an in-process room with ID `switchai-incident-room` and registers the three agent definitions with that adapter.
- The browser chat displays a local room named `devflow-team` and reads incident history from the backend. That page is not connected to the adapter's event emitter, so it is not a Switch channel.
- `SwitchProtocolAdapter` contains unimplemented methods. No real Switch credentials, room, or message exchange have been verified.

The backend configuration reads `SWITCH_API_URL`, `SWITCH_API_KEY`, and `SWITCH_ROOM_ID`, but the example environment file contains placeholder Switch variable names and the protocol adapter is not implemented. Leave `SWITCH_ENABLED=false` for the working local demo; setting it to `true` does not create a real connection.

## Run locally

Requirements: Node.js and npm.

From the repository root, create `.env` from the example only if you do not already have a local `.env` file:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

In the first terminal, start the backend:

```powershell
cd server
npm install
npm run dev
```

In a second terminal, start the frontend:

```powershell
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite development server forwards `/api` requests to the backend on port `5000`. The example environment uses in-memory storage, demo seed data, and the mock provider; no AI or Switch API key is needed for this mode.

To stop the servers, press `Ctrl+C` in each terminal.

## Sample demo report

Paste this into Team Chat:

```text
Our GET /api/users/100 endpoint returns HTTP 500 when the user does not exist.

Expected result: HTTP 404.
Service: users-api
Environment: development
```

The chat displays the report, triage result, investigation summary, remediation proposal, and final approval-required status. The local provider labels an unverified root cause as a hypothesis and notes when logs or deployment data are missing.

## Data, approval, and safety

- Incidents are stored in memory and are cleared when the backend process restarts.
- The AI provider is mocked; outputs are demonstrations, not source-backed analysis.
- The current incident detail approval action records a decision and adds a simulated rollback event. It is not GitHub PR approval and performs no production deployment.
- `.env` is ignored by Git. Keep real credentials out of committed files.
- The local agents do not receive arbitrary shell-execution tools.

## Checks

```powershell
# Frontend production build
cd client
npm run build

# Backend test suite
cd ../server
npm test
```

See [`docs/architecture.md`](docs/architecture.md), [`docs/switch-integration.md`](docs/switch-integration.md), and [`docs/demo-guide.md`](docs/demo-guide.md) for more detail.
