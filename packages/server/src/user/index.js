/**
 * @template [T=unknown]
 */
export class User {
  /**
   * @param {object} param
   * @param {string} param.key
   * @param {string} param.shard
   * @param {T} param.state
   */
  constructor({
    key,
    shard,
    state,
  }) {
    this.key = key;
    this.shard = shard;
    this.state = state;
  }
}

/**
 * @typedef {User} UserType
 */
