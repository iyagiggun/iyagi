import { ShardMessage } from './message/index.js';

let shardKeyDummy = 0;

export class Shard {
  #key;

  /**
   * @param {Object} p
   * @param {import('../object/iobject.js').IObject[]} p.objects
   */
  constructor({
    objects,
  }) {
    this.#key = `${shardKeyDummy++}`;
    this.objects = objects;
    this.message = new ShardMessage(this);
  }

  get key() {
    return this.#key;
  }

  set key(_) {
    throw new Error('Shard key cannot be modified.');
  }
}

/**
 * @typedef {Shard} ShardType
 */
