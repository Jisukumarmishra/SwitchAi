/**
 * In-memory repository backed by a Map.
 * Provides CRUD operations for any entity type.
 */
class MemoryRepository {
  constructor() {
    /** @type {Map<string, object>} */
    this._store = new Map();
    /** Simple lock flag for pseudo-thread-safety in async flows. */
    this._locked = false;
  }

  /* ------------------------------------------------------------------ */
  /*  Internal helpers                                                    */
  /* ------------------------------------------------------------------ */

  async _acquireLock() {
    while (this._locked) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    this._locked = true;
  }

  _releaseLock() {
    this._locked = false;
  }

  /**
   * Return a deep clone so callers cannot mutate the store directly.
   */
  _clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                         */
  /* ------------------------------------------------------------------ */

  async findAll() {
    return Array.from(this._store.values()).map((v) => this._clone(v));
  }

  async findById(id) {
    const item = this._store.get(id);
    return item ? this._clone(item) : null;
  }

  async create(entity) {
    await this._acquireLock();
    try {
      this._store.set(entity.id, this._clone(entity));
      return this._clone(entity);
    } finally {
      this._releaseLock();
    }
  }

  async update(id, updates) {
    await this._acquireLock();
    try {
      const existing = this._store.get(id);
      if (!existing) return null;

      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      this._store.set(id, updated);
      return this._clone(updated);
    } finally {
      this._releaseLock();
    }
  }

  async delete(id) {
    await this._acquireLock();
    try {
      const existed = this._store.has(id);
      this._store.delete(id);
      return existed;
    } finally {
      this._releaseLock();
    }
  }
}

module.exports = MemoryRepository;
