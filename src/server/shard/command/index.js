import { getDirectionByDelta } from '../../../coords/index.js';
import { ShardForge } from '../forge.js';
import { ServerCameraCommandBuilder } from './camera.js';
import { ServerEffectCommandBuilder } from './effect.js';
export class ServerCommand {
  /**
   * @type {import('../../const/index.js').ServerMessage[]}
   */
  #list = [];

  constructor() {
    this.camera = new ServerCameraCommandBuilder(this, this.#list);
    this.effect = new ServerEffectCommandBuilder(this, this.#list);
  }

  /**
   * @param {number} delay ms
   */
  wait(delay) {
    this.#list.push({
      type: 'wait',
      data: {
        delay,
      },
    });
    return this;
  }

  /**
   * @param {object} param
   * @param {import('../../user/index.js').UserType} param.user
   * @param {string} param.shard
   */
  enter({ user, shard: shardKey }) {
    const shard = ShardForge.seek(shardKey);
    user.shard = shardKey;
    this.#list.push({
      type: 'shard.clear',
    }
    );
    this.#list.push({
      type: 'shard.load',
      data: {
        shard: {
          objects: shard.objects.map((o) => o.toLoadData()),
        },
      },
    });
    return this;
  }

  /**
   * @param {import('../../object/index.js').ServerObject} target
   */
  control(target) {
    this.#list.push({
      type: 'shard.control',
      data: {
        target: target.id,
      },
    });
    return this;
  }

  release() {
    this.#list.push({
      type: 'shard.release',
    });
    return this;
  }

  /**
   * @param {string | import('../../object/index.js').ServerObject} target
   */
  remove(target) {
    const id = typeof target === 'string' ? target :  target.id;
    // const idx = this.#objects.findIndex((obj) => obj.id === id);
    // if (idx > -1) {
    //   this.#objects.splice(idx, 1);
    // }
    this.#list.push({
      type: 'shard.remove',
      data: {
        id,
      },
    });
    return this;
  }

  /**
   * @param {import("../../object/index.js").ServerObject} target
   * @param {{
   *  x?: number,
   *  y?: number,
   *  z?: number,
   *  speed?: 1 | 2 | 3,
   *  direction?: import("../../../commons/coords.js").Direction,
   *  instant?: boolean;
   * }} info
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

    this.#list.push({
      type: 'object.move',
      data: {
        target: target.id,
        ...target.getClientXYZ(),
        direction: target.direction,
        speed: info.speed,
        instant: !!info.instant,
      },
    });
    return this;
  }

  /**
   * @param {import('../../object/index.js').ServerObject} target
   * @param {string[]} message
   */
  talk(target, ...message) {
    this.#list.push({
      type: 'object.talk',
      data: {
        target: target.id,
        message: message,
      },
    });
    return this;
  }

  /**
   * @param {import('../../object/index.js').ServerObject} target
   * @param {string} motion
   */
  motion(target, motion) {
    target.motion = motion;
    this.#list.push({
      type: 'object.motion',
      data: {
        target: target.id,
        motion,
      },
    });
    return this;
  }

  build() {
    return this.#list;
  }
}
