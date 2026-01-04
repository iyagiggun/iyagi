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

  /**
   * @param {import("../const/index.js").ServerMessage} _message
   */
  // eslint-disable-next-line no-unused-vars
  send(message) {
    throw new Error('Not implemented');
  }
}

/**
 * @typedef {User} UserType
 */
