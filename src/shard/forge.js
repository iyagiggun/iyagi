import { Shard } from './index.js';

/**
 * @type {Map<string, Shard>}
 */
let shards = new Map();

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
    shards.set(shard.key, shard);
    return shard;
  },
  /**
   *
   * @param {string} key
   */
  seek: (key) => {
    return shards.get(key);
  },
};
