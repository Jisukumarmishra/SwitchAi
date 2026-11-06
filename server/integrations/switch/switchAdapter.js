/**
 * SwitchAdapter — abstract interface for communicating with the Switch platform.
 * Concrete adapters (localDemoAdapter, switchProtocolAdapter) extend this.
 */
class SwitchAdapter {
  /**
   * Send a message to a Switch room/channel.
   * @param {string} roomId
   * @param {object} message
   */
  async sendMessage(_roomId, _message) {
    throw new Error('sendMessage() not implemented');
  }

  /**
   * Register a handler for incoming messages.
   * @param {string} roomId
   * @param {function} handler
   */
  async receiveMessage(_roomId, _handler) {
    throw new Error('receiveMessage() not implemented');
  }

  /**
   * Join a Switch room/channel.
   * @param {string} roomId
   */
  async joinRoom(_roomId) {
    throw new Error('joinRoom() not implemented');
  }

  /**
   * Register an agent identity with the Switch platform.
   * @param {object} agentInfo
   */
  async registerAgent(_agentInfo) {
    throw new Error('registerAgent() not implemented');
  }
}

module.exports = SwitchAdapter;
