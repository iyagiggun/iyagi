import { message } from '../message/index.js';

/**
 * @template [T=unknown]
 */
export class User {
  /**
   * @type {import('../shard/index.js').Shard | null}
   */
  #shard = null;

  #message;

  /**
   * @param {string} key
   * @param {T} state
   */
  constructor(key, state) {
    this.key = key;
    this.#message = message;
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

  get message() {
    return this.#message;
  }
}

/**
 * @typedef {User} UserType
 */
