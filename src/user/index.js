export class User {
  /**
   * @type {import('../shard/index.js').Shard | null}
   */
  #shard = null;
  /**
   * @param {string} key
   */
  constructor(key) {
    this.key = key;
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
