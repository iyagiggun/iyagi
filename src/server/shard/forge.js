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
    return shards.get(key);
  },
};
