import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { ShardForge } from '../shard/forge.js';

/**
 * @typedef {{ send: (data: string) => void }} Socket
 */

/**
 * @typedef {{
 *  key: string;
 *  name: string;
 *  shard: string;
 *  avatar: import('../object/index.js').ObjType;
 * }} UserParam
 */

export class User {

  #key;

  /** @type {function | undefined} */
  #callback = undefined;

  /** @type {Socket | null} */
  socket = null;

  /**
   * @param {UserParam} param
   */
  constructor({
    key,
    name,
    shard,
    avatar,
  }) {
    this.#key = key;
    this.shard = ShardForge.seek(shard);
    this.name = name;
    this.avatar = avatar;
    this.controllable = false;
  }

  /**
   * @readonly
   */
  get key() {
    return this.#key;
  }

  /**
   * @param {Socket} socket
   */
  activate(socket) {
    this.socket = socket;
  }

  #leave() {
    this.shard.users.delete(this);
    this.controllable = false;
    this.shard.sync([{
      type: BUILT_IN_SERVER_MESSAGE_TYPES.SHARD_LEAVE,
      data: {
        user: this.key,
      },
    }]);
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
    const avatars = shard.users.list().map((u) => u.avatar);
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
   * @param {import("../const/index.js").ServerMessage[]} messages
   * @param {Object} [options]
   * @param {function} [options.callback]
   */
  send(messages, options = {}) {
    if (this.socket === null) {
      throw new Error('user is not activated');
    }

    const callback = options.callback ? true : undefined;
    if (callback) {
      this.#callback = options.callback;
    }

    const payload = {
      messages,
      callback,
    };
    this.socket.send(JSON.stringify(payload));
  }

  callback() {
    this.#callback?.();
    this.#callback = undefined;
  }
}

/**
 * @typedef {User} UserType
 */
