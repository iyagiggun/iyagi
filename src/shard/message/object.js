import { IMT } from '../../const/message.js';
import { getDirectionByDelta } from '../../coords/index.js';

/**
 * @typedef {string | { serial: string }} Target
 */

export class ShardObjectMessage {

  #objects;

  /**
   * @param {import('../../object/iobject.js').IObject[]} objects
   */
  constructor(objects) {
    this.#objects = objects;
  }

  /**
   * @param {Target} target
   */
  #find(target) {
    const serial = typeof target === 'string' ? target :  target.serial;
    const t = this.#objects.find((obj) => obj.serial === serial);
    if (!t) {
      throw new Error('Fail to find target object data.');
    }
    return t;
  }

  /**
   * @param {Target} target
   * @param {string | string[]} message
   */
  talk(target, message) {
    const serial = typeof target === 'string' ? target :  target.serial;
    const obj = this.#find(serial); // for valid check
    return {
      type: IMT.OBJECT_TALK,
      data: {
        target: obj.serial,
        message,
      },
    };
  }

  /**
   * @param {Target} target
   * @param {(import('../../coords/index.js').XYZ | import('../../coords/index.js').XY) & {
   *  speed?: 1 | 2 | 3,
   *  direction?: import('../../coords/index.js').Direction
   * }} info
   */
  move(target, info) {
    const t = this.#find(target);
    // const targetHitbox = t.hitbox;

    // if (targetHitbox) {
    //   const [pressed, unpressed] = info.shard.objects.reduce(
    //     /**
    //      * @param {[import('./iobject.js').IObject[], import('./iobject.js').IObject[]]} acc
    //      * @param {import('./iobject.js').IObject} obj
    //      * @return {[import('./iobject.js').IObject[], import('./iobject.js').IObject[]]}
    //      */
    //     ([_pressed, _unpressed], obj) => {
    //       if (!obj.hitbox || obj.z !== (t.z - 1)) {
    //         return [_pressed, _unpressed];
    //       }
    //       console.error(obj.serial);
    //       if (isOverlap(targetHitbox, obj.hitbox)) {
    //         return [[..._pressed, obj], _unpressed];
    //       }
    //       return [_pressed, [..._unpressed, obj]];

    //     }, [[], []]);
    //   console.error(pressed);
    //   console.error(unpressed);
    // }

    t.direction = info.direction || getDirectionByDelta(t, info);
    t.x = info.x;
    t.y = info.y;
    t.z = 'z' in info ? info.z : t.z;

    return {
      type: IMT.OBJECT_MOVE,
      data: {
        target: t.serial,
        ...t.xyz,
        direction: t.direction,
        speed: info.speed,
      },
    };
  }

  /**
   * @param {Target} target
   * @param {string} motion
   */
  motion(target, motion) {
    const t = this.#find(target);
    t.motion = motion;
    return {
      type: IMT.OBJECT_MOTION,
      data: {
        target: t.serial,
        motion,
      },
    };
  }

  /**
   * @param {Target} target
   */
  control(target) {
    const t = this.#find(target);
    return {
      type: IMT.OBJECT_CONTROL,
      data: {
        target: t.serial,
      },
    };
  }

  /**
   * @param {Target} target
   */
  remove(target) {
    const serial = typeof target === 'string' ? target :  target.serial;
    const idx = this.#objects.findIndex((obj) => obj.serial === serial);
    if (idx > -1) {
      this.#objects.splice(idx, 1);
    }
    return {
      type: IMT.OBJECT_REMOVE,
      data: {
        target: serial,
      },
    };
  }
}
