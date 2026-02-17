import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { ShardForge } from '../shard/forge.js';

/**
 * @typedef {Object} Avatar
 * @property {import('../object/index.js').ServerObjectResourceType} resource
 */

/**
 * @template [T=unknown]
 */
export class User {

  #key;

  /**
   * @param {object} param
   * @param {string} param.key
   * @param {string} param.name
   * @param {string} param.shard
   * @param {import('../object/index.js').ServerObjectType} param.avatar
   * @param {T} param.state
   */
  constructor({
    key,
    name,
    shard,
    avatar,
    state,
  }) {
    this.#key = key;
    this.shard = ShardForge.seek(shard);
    this.state = state;
    this.name = name;
    this.avatar = avatar;
  }

  /**
   * @readonly
   */
  get key() {
    return this.#key;
  }

  #leave() {
    this.shard.users.delete(this);
    this.shard.users.forEach((u) => {
      u.send([{
        type: BUILT_IN_SERVER_MESSAGE_TYPES.SHARD_LEAVE,
        data: {
          user: this.key,
        },
      }]);
    });
  }

  /**
   * @param {string} [shardKey]
   */
  load(shardKey) {
    const shard = shardKey ? ShardForge.seek(shardKey) : this.shard;
    this.#leave();
    shard.sync([{
      type: BUILT_IN_SERVER_MESSAGE_TYPES.SHARD_JOIN,
      data: {
        resources: [this.avatar.resource.toClientData()],
        objects: [this.avatar.toClientData()],
      },
    }]);
    this.shard = shard;
    shard.users.add(this);
    const avatars = [...shard.users].map((u) => u.avatar);
    this.send([{
      type: BUILT_IN_SERVER_MESSAGE_TYPES.SHARD_LOAD,
      data: {
        now: performance.now(),
        shard: {
          key: shard.key,
          resources: [
            ...new Set([
              ...shard.objects.map((o) => o.resource),
              ...avatars.map((a) => a.resource),
            ]),
          ].map((r) => r.toClientData()),
          objects: [
            ...shard.objects,
            ...avatars,
          ].map((o) => o.toClientData()),
        },
      },
    }]);
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
