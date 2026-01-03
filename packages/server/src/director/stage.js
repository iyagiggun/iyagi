import { BUILT_IN_SERVER_MESSAGE_TYPES, getDirectionByDelta } from '@iyagi/commons';
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
   * @param {object} param
   * @param {import('../user/index.js').UserType} param.user
   * @param {string} param.shard
   */
  enter({ user, shard: shardKey }) {
    const shard = ShardForge.seek(shardKey);
    user.shard = shardKey;

    return ({
      type: BUILT_IN_SERVER_MESSAGE_TYPES.SHARD_LOAD,
      data: {
        shard: {
          resources: [...new Set(shard.objects.map((o) => o.resource))].map((r) => r.toClientData()),
          objects: shard.objects.map((o) => o.toClientData()),
        },
      },
    });
  },

  /**
   * @param {import('../object/index.js').ServerObject} target
   * @param {{
   *  x?: number,
   *  y?: number,
   *  z?: number,
   *  speed?: 1 | 2 | 3,
   *  direction?: import('@iyagi/commons/coords').Direction,
   *  instant?: boolean;
   *  track?: boolean;
   * }} info
   * @returns {import('../const/index.js').ServerMessage}
   */
  move(target, info) {
    const lastXYZ = target.xyz;

    if (typeof info.x === 'number') {
      target.x = info.x;
    }

    if (typeof info.y === 'number') {
      target.y = info.y;
    }

    if (typeof info.z === 'number') {
      target.z = info.z;
    }

    target.direction = info.direction || (info.instant ? target.direction : getDirectionByDelta(lastXYZ, target));

    /**
     * @type {import('../const/index.js').ServerMessage}
     */
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_MOVE,
      data: {
        target: target.id,
        ...target.getClientXYZ(),
        direction: target.direction,
        speed: info.speed,
        instant: !!info.instant,
        track: info.track,
      },
    };
  },

  /**
   * @param {import('../object/index.js').ServerObject} target
   * @param {string[]} message
   * @return {import('../const/index.js').ServerMessage}
   */
  talk(target, ...message) {
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_TALK,
      data: {
        target: target.id,
        message: message,
      },
    };
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
    const id = typeof target === 'string' ? target :  target.id;
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
