import { IMT } from '../../../const/message.js';
import { getDirectionByDelta } from '../../../coords/index.js';

/**
 * @typedef {{ id: string }} Target
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
   * @param {import('../../object/iobject.js').IObject} target
   */
  #find(target) {
    if (!this.#objects.includes(target)) {
      throw new Error('Fail to find target object data.');
    }
    return target;
  }

  /**
   * @param {import('../../object/iobject.js').IObject} target
   * @param {string[]} message
   */
  talk(target, ...message) {
    const obj = this.#find(target); // for valid check
    return {
      type: IMT.OBJECT_TALK,
      data: {
        target: obj.id,
        message: message,
      },
    };
  }

  /**
   * @param {import('../../object/iobject.js').IObject} target
   * @param {{
   *  x?: number,
   *  y?: number,
   *  z?: number,
   *  speed?: 1 | 2 | 3,
   *  direction?: import('../../../coords/index.js').Direction,
   *  instant?: boolean;
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

    const lastXYZ = t.xyz;

    if (typeof info.x === 'number') {
      t.x = info.x;
    }

    if (typeof info.y === 'number') {
      t.y = info.y;
    }

    if (typeof info.z === 'number') {
      t.z = info.z;
    }

    t.direction = info.direction || (info.instant ? t.direction : getDirectionByDelta(lastXYZ, t));

    return {
      type: IMT.OBJECT_MOVE,
      data: {
        target: t.id,
        ...t.getClientXYZ(),
        direction: t.direction,
        speed: info.speed,
        instant: !!info.instant,
      },
    };
  }

  /**
   * @param {import('../../object/iobject.js').IObject} target
   * @param {string} motion
   */
  motion(target, motion) {
    const t = this.#find(target);
    t.motion = motion;
    return {
      type: IMT.OBJECT_MOTION,
      data: {
        target: t.id,
        motion,
      },
    };
  }

  /**
   * @param {import('../../object/iobject.js').IObject} target
   */
  control(target) {
    const t = this.#find(target);
    return {
      type: IMT.OBJECT_CONTROL,
      data: {
        target: t.id,
      },
    };
  }

  release() {
    return {
      type: IMT.OBJECT_RELEASE,
    };
  }

  /**
   * @param {Target} target
   */
  remove(target) {
    const id = typeof target === 'string' ? target :  target.id;
    // const idx = this.#objects.findIndex((obj) => obj.id === id);
    // if (idx > -1) {
    //   this.#objects.splice(idx, 1);
    // }
    return {
      type: IMT.OBJECT_REMOVE,
      data: {
        id,
      },
    };
  }
}
