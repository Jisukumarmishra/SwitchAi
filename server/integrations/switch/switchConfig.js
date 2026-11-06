/**
 * Switch platform configuration loaded from environment variables.
 */
const config = require('../../config/env');

module.exports = {
  apiUrl: config.SWITCH_API_URL,
  apiKey: config.SWITCH_API_KEY,
  roomId: config.SWITCH_ROOM_ID,
  enabled: config.SWITCH_ENABLED,
};
