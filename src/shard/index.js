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
  }
  get key() {
    return this.#key;
  }
  set key(_) {
    throw new Error('Shard key cannot be modified.');
  }
}

/**
 * @type {Shard[]}
 */
let shards = [];

export const ShardForge = {
  /**
   * @param {Object} p
   * @param {import('../object/iobject.js').IObject[]} p.objects
   */
  shatter: ({
    objects,
  }) => {
    const shard = new Shard({
      objects,
    });
    shards.push;
    return shard;
  },
  /**
   *
   * @param {string} key
   */
  seek: (key) => {
    return shards.find((each) => each.key === key);
  },
};
