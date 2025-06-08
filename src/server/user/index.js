/**
 * @template [T=unknown]
 */
export class User {
  /**
   * @type {import('../shard/index.js').Shard}
   */
  #shard;

  /**
   * @param {object} param
   * @param {string} param.key
   * @param {import('../shard/index.js').ShardType} param.shard
   * @param {T} param.state
   */
  constructor({
    key,
    shard,
    state,
  }) {
    this.key = key;
    this.#shard = shard;
    this.state = state;
  }

  get shard() {
    if (!this.#shard) {
      throw new Error('User does not have a shard.');
    }
    return this.#shard;
  }
  /**
   * @param {import('../shard/index.js').Shard} _shard
   */
  set shard(_shard) {
    this.#shard = _shard;
  }
}

/**
 * @typedef {User} UserType
 */
