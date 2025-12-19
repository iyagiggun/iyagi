/**
 * @type {Map<string, import('./index.js').Shard>}
 */
let shards = new Map();


export const ShardForge = {
  /**
   * @param {import('./index.js').Shard} shard
   */
  shatter: (shard) => {
    shards.set(shard.key, shard);
    return shard;
  },
  /**
   *
   * @param {string} key
   */
  seek: (key) => {
    const shard = shards.get(key);
    if (!shard) {
      throw new Error(`Fail to seek shard. key = ${key}`);
    }
    return shard;
  },
};
