import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { ShardForge } from '../shard/forge.js';

export const StageDirector = {

  /**
   * @param {number} delay ms
   * @returns {import('../const/index.js').ServerMessage}
   */
  wait(delay) {
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.WAIT,
      data: {
        delay,
      },
    };
  },

  /**
   * Side effects occur
   * @param {object} param
   * @param {import('../user/index.js').UserType} param.user
   * @param {string} param.shard
   */
  enter({ user, shard: shardKey }) {
    user.shard.leave$.next(user);
    const shard = ShardForge.seek(shardKey);
    user.shard = shard;
    return ({
      type: BUILT_IN_SERVER_MESSAGE_TYPES.SHARD_LOAD,
      data: {
        now: performance.now(),
        shard: {
          key: shardKey,
          resources: [...new Set(shard.objects.map((o) => o.resource))].map((r) => r.toClientData()),
          objects: shard.objects.map((o) => o.toClientData()),
        },
      },
    });
  },

  /**
   * @param {import('../object/index.js').ServerObject} target
   * @param {string} motion
   * @param {object} [options]
   * @param {number} [options.speed]
   */
  action(target, motion, options = {}) {
    target.motion = motion;
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_ACTION,
      data: {
        target: target.id,
        motion,
        options: {
          speed: options.speed,
        },
      },
    };
  },

  /**
   * @param {string | import('../object/index.js').ServerObject} target
   */
  remove(target) {
    const id = typeof target === 'string' ? target : target.id;
    // const idx = this.#objects.findIndex((obj) => obj.id === id);
    // if (idx > -1) {
    //   this.#objects.splice(idx, 1);
    // }
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_REMOVE,
      data: {
        id,
      },
    };
  },

  /**
   * @param {import('../object/index.js').ServerObject} target
   */
  control(target) {
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.CONTROL,
      data: {
        target: target.id,
      },
    };
  },

  release() {
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.CONTROL_RELEASE,
    };
  },
};
