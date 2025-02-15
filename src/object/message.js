import { IMT } from '../const/message.js';
import { getDirectionByDelta } from '../coords/index.js';
import { message } from '../message/index.js';

export class IObjectMessage {
  #obj;

  /**
    *
    * @param {import("./iobject.js").IObjectType} obj
    */
  constructor(obj) {
    this.#obj = obj;
  }



  /**
    * @param {(import('../coords/index.js').XYZ | import('../coords/index.js').XY) & {
   *  speed?: 1 | 2 | 3,
   *  shard: import('../shard/index.js').ShardType,
   *  direction?: import("./iobject.js").Direction
   * }} info
   */
  move(info) {
    const t = info.shard.objects.find((obj) => obj.serial === this.#obj.serial);
    if (!t) {
      throw new Error('No object in the shard.');
    }
    t.direction = info.direction || getDirectionByDelta(t, info);
    // t.direction = info.direction;
    t.x = info.x;
    t.y = info.y;
    t.z = 'z' in info ? info.z : this.#obj.z;
    return {
      type: IMT.OBJECT_MOVE,
      data: {
        target: t.serial,
        ...t,
        speed: info.speed,
      },
    };
  }

  /**
   * @param {string | string[]} message
   */
  talk(message) {
    return {
      type: IMT.OBJECT_TALK,
      data: {
        target: this.#obj.serial,
        message,
      },
    };
  }

  /**
   * @param {0 | 1 | 2 | 3} [speed] 0: instantly
   */
  focus(speed = 1) {
    const hitbox = this.#obj.hitbox;
    return message.focus({
      x: this.#obj.x + (hitbox ? hitbox.w/2 : 0),
      y: this.#obj.y + (hitbox ? hitbox.h/2 : 0),
      speed,
    });
  }

  control() {
    return {
      type: IMT.OBJECT_CONTROL,
      data: {
        target: this.#obj.serial,
      },
    };
  }

  /**
   * @param {import('../shard/index.js').ShardType} shard
   */
  remove(shard) {
    const idx = shard.objects.findIndex((obj) => obj.key === this.#obj.key);
    if (idx > -1) {
      shard.objects.splice(idx, 1);
    }
    return {
      type: IMT.OBJECT_REMOVE,
      data: {
        target: this.#obj.serial,
      },
    };
  }

  /**
   * @param {string} motion
   */
  motion(motion) {
    return {
      type: IMT.OBJECT_MOTION,
      data: {
        target: this.#obj.serial,
        motion,
      },
    };

  }

}
