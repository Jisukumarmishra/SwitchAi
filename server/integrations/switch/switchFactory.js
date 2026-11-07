const LocalDemoAdapter = require('./localDemoAdapter');
const SwitchProtocolAdapter = require('./switchProtocolAdapter');
const config = require('../../config/env');

let instance = null;

function getSwitchAdapter() {
  if (!instance) {
    if (config.SWITCH_ENABLED) {
      instance = new SwitchProtocolAdapter();
    } else {
      instance = new LocalDemoAdapter();
    }
  }
  return instance;
}

module.exports = { getSwitchAdapter };
