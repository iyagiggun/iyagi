import { ShardForge } from '../shard/forge.js';

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
    this.shard = ShardForge.seek(shard);
    this.state = state;
  }

  /**
   * @param {import("../const/index.js").ServerMessage[]} _message
   */
  // eslint-disable-next-line no-unused-vars
  send(_message) {
    throw new Error('Not implemented');
  }
}

/**
 * @typedef {User} UserType
 */
