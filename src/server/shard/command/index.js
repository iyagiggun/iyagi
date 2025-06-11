import { getDirectionByDelta } from '../../../coords/index.js';
import { ShardForge } from '../forge.js';
import { CameraCommand } from './camera.js';
import { EffectCommand } from './effect.js';

export const ServerCommand = {
  camera: CameraCommand,
  effect: EffectCommand,

  /**
   * @param {number} delay ms
   * @returns {import('../../const/index.js').ServerMessage}
   */
  wait(delay) {
    return {
      type: 'wait',
      data: {
        delay,
      },
    };
  },

  /**
   * @param {import('../../const/index.js').ServerMessage[]} list
   * @returns {import('../../const/index.js').ServerMessage}
   */
  list(list) {
    return {
      type: 'list',
      data: {
        list,
      },
    };
  },

  /**
   * @param {object} param
   * @param {import('../../user/index.js').UserType} param.user
   * @param {string} param.shard
   * @returns
   */
  enter({ user, shard }) {
    user.shard = ShardForge.seek(shard);
    return this.list([
      {
        type: 'shard.clear',
      },
      {
        type: 'shard.load',
        data: {
          shard: {
            objects: user.shard.objects.map((o) => o.toLoadData()),
          },
        },
      },
    ]);
  },

  /**
   * @param {import('../../object/index.js').ServerObjectType} target
   * @returns {import('../../const/index.js').ServerMessage}
   */
  control(target) {
    return {
      type: 'shard.control',
      data: {
        target: target.id,
      },
    };
  },

  /**
   * @returns {import('../../const/index.js').ServerMessage}
   */
  release() {
    return {
      type: 'shard.release',
    };
  },

  /**
   * @param {string | import('../../object/index.js').ServerObjectType} target
   * @returns {import('../../const/index.js').ServerMessage}
   */
  remove(target) {
    const id = typeof target === 'string' ? target :  target.id;
    // const idx = this.#objects.findIndex((obj) => obj.id === id);
    // if (idx > -1) {
    //   this.#objects.splice(idx, 1);
    // }
    return {
      type: 'shard.remove',
      data: {
        id,
      },
    };
  },

  /**
   * @param {import("../../object/index.js").ServerObjectType} target
   * @param {{
   *  x?: number,
   *  y?: number,
   *  z?: number,
   *  speed?: 1 | 2 | 3,
   *  direction?: import("../../../commons/coords.js").Direction,
   *  instant?: boolean;
   * }} info
   * @returns {import("../../const/index.js").ServerMessage}
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

    return {
      type: 'object.move',
      data: {
        target: target.id,
        ...target.getClientXYZ(),
        direction: target.direction,
        speed: info.speed,
        instant: !!info.instant,
      },
    };
  },

  /**
   * @param {import('../../object/index.js').ServerObjectType} target
   * @param {string[]} message
   * @return {import('../../const/index.js').ServerMessage}
   */
  talk(target, ...message) {
    return {
      type: 'object.talk',
      data: {
        target: target.id,
        message: message,
      },
    };
  },

  /**
   * @param {import('../../object/index.js').ServerObjectType} target
   * @param {string} motion
   * @return {import('../../const/index.js').ServerMessage}
   */
  motion(target, motion) {
    target.motion = motion;
    return {
      type: 'object.motion',
      data: {
        target: target.id,
        motion,
      },
    };
  },
};
