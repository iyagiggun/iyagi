import { ServerObject } from '../object/index.js';

export class ShardUsers {

  /** @type {Set<import('../user/index.js').UserType>} */
  #set = new Set();

  /** @param {import('../user/index.js').UserType} user */
  add(user) {
    this.#set.add(user);
  }

  /** @param {import('../user/index.js').UserType} user */
  delete(user) {
    this.#set.delete(user);
  }

  list() {
    return [...this.#set];
  }

  /** @readonly */
  get size() {
    return this.#set.size;
  }

  /**
   * @param {ServerObject} p
   */
  find(p) {
    if (p instanceof ServerObject) {
      return this.list().find((u) => u.avatar === p);
    }
    throw new Error('Invalid argument: p should be an instance of ServerObject');
  }
}
