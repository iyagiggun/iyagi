import { IMT } from '../const/message.js';
import { getDirectionByDelta } from '../coords/index.js';

/**
 * @typedef {import('../object/iobject.js').IObject} IObject
 */

export class ShardMessage {
  #shard;
  /**
   * @param {import('./index.js').Shard} shard
   */
  constructor(shard) {
    this.#shard = shard;
  }

  /**
   * @param {IObject} target
   * @param {string | string[]} message
   */
  talk(target, message) {
    return {
      type: IMT.SCENE_TALK,
      data: {
        // TODO ?? name ?? key ?? f...
        target: target.name,
        message,
      },
    };
  }

  /**
   * @param {IObject} target
   * @param {import('../coords/index.js').Position} position
   * @param {Object} [options={}]
   * @param {import('../coords/index.js').Direction} [options.direction]
   */
  move(target, position, options) {
    const t = this.#shard.objects.find((each) => each.name === target.name);
    if (!t) {
      throw new Error(`No "${target.name}" in the shard.`);
    }
    const direction = options?.direction ?? getDirectionByDelta(t.position, position);
    t.position = position;
    return {
      type: IMT.SCENE_MOVE,
      data: {
        target: t.name,
        direction,
        position,
      },
    };
  }

  /**
   * @param {string} target
   */
  focus(target) {
    return {
      type: IMT.SCENE_FOCUS,
      data: {
        target,
      },
    };
  }

  /**
   * @param {string} key
   * @param {*[]} list
   */
  take(key, list) {
    return {
      type: IMT.SCENE_TAKE,
      data: {
        key,
        list,
      },
    };
  }

  /**
   * @param {string} target
   */
  control(target) {
    return {
      type: IMT.SCENE_CONTROL,
      data: {
        target,
      },
    };
  }
}
