const SwitchAdapter = require('./switchAdapter');
const switchConfig = require('./switchConfig');

/**
 * Switch Protocol Adapter — scaffold for the real Switch platform integration.
 *
 * This adapter will communicate with the actual Switch API once endpoints and
 * authentication details are finalized.  All methods contain TODO markers.
 */
class SwitchProtocolAdapter extends SwitchAdapter {
  constructor() {
    super();
    this.config = switchConfig;
  }

  async sendMessage(roomId, message) {
    // TODO: Implement actual Switch API call to send a message.
    // Example (not real — do NOT assume this is the actual Switch API):
    //   const res = await fetch(`${this.config.apiUrl}/rooms/${roomId}/messages`, {
    //     method: 'POST',
    //     headers: { Authorization: `Bearer ${this.config.apiKey}`, 'Content-Type': 'application/json' },
    //     body: JSON.stringify(message),
    //   });
    //   return res.json();
    throw new Error('SwitchProtocolAdapter.sendMessage() is not yet implemented');
  }

  async receiveMessage(roomId, _handler) {
    // TODO: Implement websocket or polling listener for incoming messages.
    throw new Error('SwitchProtocolAdapter.receiveMessage() is not yet implemented');
  }

  async joinRoom(roomId) {
    // TODO: Implement room-join handshake with the Switch API.
    throw new Error('SwitchProtocolAdapter.joinRoom() is not yet implemented');
  }

  async registerAgent(agentInfo) {
    // TODO: Implement agent registration with the Switch platform.
    throw new Error('SwitchProtocolAdapter.registerAgent() is not yet implemented');
  }
}

module.exports = SwitchProtocolAdapter;
