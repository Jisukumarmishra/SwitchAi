const MockAIProvider = require('./mockAIProvider');

/**
 * Returns the appropriate AI provider based on the configured mode.
 *
 * @param {string} mode - 'mock' | 'openai' | etc.
 * @returns {MockAIProvider}
 */
function getProvider(mode = 'mock') {
  switch (mode) {
    case 'mock':
      return new MockAIProvider();

    // TODO: Add real provider integrations
    // case 'openai':
    //   return new OpenAIProvider();

    default:
      console.warn(`[providerFactory] Unknown AI_PROVIDER "${mode}", falling back to mock.`);
      return new MockAIProvider();
  }
}

module.exports = { getProvider };
