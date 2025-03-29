let shards = new Map();


export const ShardForge = {
  /**
   * @param {string} key
   * @param {import('./index.js').Shard} shard
   */
  shatter: (key, shard) => {
    shards.set(key, shard);
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
