# Switch Integration Guide

## Overview

SwitchAI is architectured to integrate with [Switch](https://switch.ai) as the central communication and collaboration layer. This document describes how the integration works and the steps to enable it.

## Current Status

| Component | Status |
|-----------|--------|
| Integration architecture | ✅ Complete |
| Local demo adapter | ✅ Complete |
| Switch protocol adapter | 🔲 Scaffold only |
| Switch API connection | 🔲 Requires configuration |
| Switch room messaging | 🔲 Requires Switch credentials |

## Architecture

```
server/integrations/switch/
├── switchAdapter.js          # Base adapter interface
├── switchConfig.js           # Configuration from env vars
├── localDemoAdapter.js       # Local development adapter
└── switchProtocolAdapter.js  # Switch API scaffold
```

### Adapter Pattern

The system uses an adapter pattern to abstract Switch communication:

```javascript
// switchAdapter.js defines the interface:
class SwitchAdapter {
  async sendMessage(roomId, message) { }
  async receiveMessage(callback) { }
  async joinRoom(roomId) { }
  async registerAgent(agentInfo) { }
}
```

- **LocalDemoAdapter** implements this locally using EventEmitter
- **SwitchProtocolAdapter** will implement it using Switch's actual API

### Configuration

Set in `.env`:

```env
SWITCH_ENABLED=false          # Set true after configuring
SWITCH_BASE_URL=              # Switch API base URL
SWITCH_ROOM_ID=               # Your Switch room ID
SWITCH_AGENT_NAME=SwitchAI    # Agent display name
SWITCH_AUTH_TOKEN=             # Authentication token
```

> **Note:** These variable names are placeholders. Adapt them to match the official Switch documentation when configuring the actual connection.

## Steps to Enable Switch Integration

### 1. Obtain Switch Credentials

- Sign up / log in to Switch
- Create a room or obtain a room ID
- Get your API credentials / auth token
- Review the Switch API documentation for exact endpoints and auth schema

### 2. Update Environment Variables

```env
SWITCH_ENABLED=true
SWITCH_BASE_URL=https://api.switch.ai   # Replace with actual URL
SWITCH_ROOM_ID=your-room-id
SWITCH_AUTH_TOKEN=your-token
```

### 3. Implement SwitchProtocolAdapter

Open `server/integrations/switch/switchProtocolAdapter.js` and implement:

1. **Authentication** — Follow Switch's auth documentation
2. **Room Joining** — Use Switch's room/channel API
3. **Message Sending** — Map SwitchAI events to Switch message format
4. **Message Receiving** — Listen for Switch events (likely SSE or WebSocket)
5. **Agent Registration** — Register AI agents in the Switch room

### 4. Message Mapping

Map SwitchAI internal events to Switch message format:

| SwitchAI Event | Switch Message |
|---------------|----------------|
| `incident:created` | New incident notification |
| `agent:finding` | Agent analysis message |
| `workflow:awaiting_approval` | Approval request |
| `workflow:resolved` | Resolution notification |

### 5. Test the Integration

1. Set `SWITCH_ENABLED=true`
2. Start the server
3. Create an incident
4. Verify messages appear in the Switch room
5. Verify agents' findings are posted to the room

## What NOT to Do

- ❌ Do not invent Switch API endpoints
- ❌ Do not guess authentication mechanisms
- ❌ Do not hardcode credentials
- ❌ Do not claim Switch is connected when it is not
- ❌ Do not bypass Switch's security model

## Expected Behavior

### When `SWITCH_ENABLED=false` (default)

- LocalDemoAdapter is used
- All communication happens in-memory
- No network requests to Switch
- Full functionality available for development and demos

### When `SWITCH_ENABLED=true`

- SwitchProtocolAdapter is initialized
- Requires valid Switch credentials
- Agent messages are sent to the configured Switch room
- Human messages in the room are received and processed
- Collaboration happens through Switch as the central hub
