const { EventEmitter } = require('events');
const SwitchAdapter = require('./switchAdapter');

/**
 * Local demo adapter — implements the SwitchAdapter interface using an
 * in-process EventEmitter so the system can be exercised without a live
 * Switch backend.
 */
class LocalDemoAdapter extends SwitchAdapter {
  constructor() {
    super();
    this._emitter = new EventEmitter();
    /** @type {Map<string, object[]>} */
    this._rooms = new Map();
    this._agents = [];
  }

  async sendMessage(roomId, message) {
    const entry = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      roomId,
      ...message,
      timestamp: new Date().toISOString(),
    };

    if (!this._rooms.has(roomId)) {
      this._rooms.set(roomId, []);
    }
    this._rooms.get(roomId).push(entry);

    this._emitter.emit(`room:${roomId}`, entry);
    return entry;
  }

  async receiveMessage(roomId, handler) {
    this._emitter.on(`room:${roomId}`, handler);
  }

  async joinRoom(roomId) {
    if (!this._rooms.has(roomId)) {
      this._rooms.set(roomId, []);
    }
    return { roomId, joined: true };
  }

  async registerAgent(agentInfo) {
    this._agents.push({ ...agentInfo, registeredAt: new Date().toISOString() });
    return { registered: true, agent: agentInfo };
  }

  /**
   * Helper: retrieve message history for a room.
   */
  getMessages(roomId) {
    return this._rooms.get(roomId) || [];
  }
}

module.exports = LocalDemoAdapter;
