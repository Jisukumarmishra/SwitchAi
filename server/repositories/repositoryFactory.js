const MemoryRepository = require('./memoryRepository');

/**
 * Returns the appropriate repository instance based on DATA_MODE.
 *
 * @param {string} mode - 'memory' | 'mongodb'
 * @returns {MemoryRepository}
 */
function getRepository(mode = 'memory') {
  switch (mode) {
    case 'memory':
      return new MemoryRepository();

    case 'mongodb':
      // TODO: Implement MongoRepository and return it here.
      // const MongoRepository = require('./mongoRepository');
      // return new MongoRepository();
      throw new Error('MongoDB repository is not yet implemented.');

    default:
      console.warn(`[repositoryFactory] Unknown DATA_MODE "${mode}", falling back to memory.`);
      return new MemoryRepository();
  }
}

module.exports = { getRepository };
