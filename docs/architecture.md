# SwitchAI Architecture

## System Overview

SwitchAI is an AI-powered collaborative DevOps incident response platform. It enables human developers and multiple specialized AI agents to collaborate on software incidents, investigate problems, suggest fixes, and manage deployment recovery.

```
┌─────────────────────────────────────────────────────────────┐
│                     SwitchAI Platform                        │
├──────────────────────┬──────────────────────────────────────┤
│   React Frontend     │          Express Backend              │
│   (Vite + Tailwind)  │          (Node.js)                    │
│                      │                                       │
│  ┌───────────────┐   │   ┌──────────────────────────┐       │
│  │  Dashboard    │   │   │    REST API Layer         │       │
│  │  Incidents    │◄──┼──►│    /api/incidents         │       │
│  │  Workspace    │   │   │    /api/agents            │       │
│  │  Agents       │   │   │    /api/integrations      │       │
│  │  Team Room    │   │   │    /api/health             │       │
│  │  Settings     │   │   └──────────┬───────────────┘       │
│  └───────────────┘   │              │                        │
│                      │   ┌──────────▼───────────────┐       │
│  SSE Connection ◄────┼───┤  Agent Orchestrator       │       │
│  (Live Updates)      │   │  ┌─────┐ ┌─────┐ ┌─────┐│       │
│                      │   │  │Triage│ │Invest│ │ Fix ││       │
│                      │   │  │Agent │ │Agent │ │Agent││       │
│                      │   │  └─────┘ └─────┘ └─────┘│       │
│                      │   └──────────┬───────────────┘       │
│                      │              │                        │
│                      │   ┌──────────▼───────────────┐       │
│                      │   │  Integration Layer        │       │
│                      │   │  ┌─────────┐ ┌──────────┐│       │
│                      │   │  │  Local   │ │  Switch  ││       │
│                      │   │  │  Demo    │ │ Protocol ││       │
│                      │   │  │ Adapter  │ │ Adapter  ││       │
│                      │   │  └─────────┘ └──────────┘│       │
│                      │   └──────────────────────────┘       │
│                      │              │                        │
│                      │   ┌──────────▼───────────────┐       │
│                      │   │  Data Layer               │       │
│                      │   │  Memory / MongoDB         │       │
│                      │   └──────────────────────────┘       │
└──────────────────────┴──────────────────────────────────────┘
```

## Agent Architecture

### Agent Orchestrator

The central coordinator that manages the incident response workflow:

1. **Receives** incident from API
2. **Dispatches** to Triage Agent
3. **Forwards** triage findings to Investigation Agent
4. **Sends** investigation results to Fix & Release Agent
5. **Collects** all findings and requests human approval
6. **Executes** approved actions (simulated in demo mode)
7. **Generates** final resolution report

### Agent Responsibilities

| Agent | Role | Input | Output |
|-------|------|-------|--------|
| **Triage Agent** | Classification & prioritization | Raw incident | Classification, severity, affected services |
| **Investigation Agent** | Root cause analysis | Incident + triage findings | Log analysis, error patterns, root causes |
| **Fix & Release Agent** | Remediation planning | All prior findings | Fix plan, rollback steps, risk assessment |

### Communication Flow

```
Developer → Incident Created
                ↓
         Triage Agent analyzes
                ↓
         Investigation Agent examines
                ↓
         Fix Agent recommends
                ↓
         Human reviews & approves/rejects
                ↓
         Resolution executed (simulated)
                ↓
         Final report generated
```

## Data Flow

### Incident Lifecycle

```
reported → triaging → investigating → fixing → awaiting_approval → approved/rejected → resolved
```

### Event Streaming (SSE)

The workflow emits real-time events via Server-Sent Events:

- `workflow:started` — Workflow initiated
- `agent:started` — Agent begins analysis
- `agent:finding` — Agent produces a finding
- `agent:completed` — Agent finishes
- `workflow:awaiting_approval` — All agents done, needs human review
- `workflow:approved` — Human approved action
- `workflow:rejected` — Human rejected action
- `workflow:resolved` — Incident resolved
- `workflow:error` — Error occurred

## Integration Architecture

### Switch Integration Layer

The platform uses an adapter pattern for Switch integration:

- **SwitchAdapter** (interface) — Defines the communication contract
- **LocalDemoAdapter** — In-memory implementation for local development
- **SwitchProtocolAdapter** — Scaffold for actual Switch API connection

The adapter is selected based on `SWITCH_ENABLED` environment variable.

### AI Provider Layer

- **MockAIProvider** — Built-in demo responses
- **ProviderFactory** — Selects provider based on `LLM_PROVIDER` env var
- Extensible for OpenAI, Anthropic, or other providers

## Security Considerations

- No credentials committed to repository
- Environment variables for all secrets
- Input validation on all API endpoints
- Safe error messages (no stack traces in production)
- No arbitrary command execution
- All destructive operations are simulated
- Human approval required before any action
