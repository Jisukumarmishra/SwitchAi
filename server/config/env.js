const path = require('path');
const dotenv = require('dotenv');

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATA_MODE: process.env.DATA_MODE || 'memory',
  DEMO_MODE: process.env.DEMO_MODE === 'true',
  MONGODB_URI: process.env.MONGODB_URI || '',
  AI_PROVIDER: process.env.AI_PROVIDER || 'mock',
  SWITCH_ENABLED: process.env.SWITCH_ENABLED === 'true',
  SWITCH_API_URL: process.env.SWITCH_API_URL || '',
  SWITCH_API_KEY: process.env.SWITCH_API_KEY || '',
  SWITCH_ROOM_ID: process.env.SWITCH_ROOM_ID || '',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

/**
 * Validate that required environment variables exist based on the
 * active configuration. Throws on missing critical vars.
 */
function validate() {
  const missing = [];

  if (config.DATA_MODE === 'mongodb' && !config.MONGODB_URI) {
    missing.push('MONGODB_URI (required when DATA_MODE=mongodb)');
  }

  if (config.SWITCH_ENABLED && !config.SWITCH_API_URL) {
    missing.push('SWITCH_API_URL (required when SWITCH_ENABLED=true)');
  }

  if (missing.length > 0) {
    console.warn(`[env] Missing environment variables:\n  - ${missing.join('\n  - ')}`);
  }
}

validate();

module.exports = config;
