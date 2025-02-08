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
        target: target.name,
        message,
      },
    };
  }

  /**
   * @param {IObject} target
   * @param {import('../coords/index.js').Position & {
   *   speed?: number,
   *   direction?: import('../coords/index.js').Direction
   * }} info
   */
  move(target, info) {
    const t = this.#shard.objects.find((each) => each.name === target.name);
    if (!t) {
      throw new Error(`No "${target.name}" in the shard.`);
    }
    const direction = info?.direction ?? getDirectionByDelta(t.position, info);
    t.position = info;
    return {
      type: IMT.SCENE_MOVE,
      data: {
        target: t.name,
        ...info,
        direction,
      },
    };
  }

  /**
   * @param {string | import('../coords/index.js').Position} target
   * @param {Object} [options={}]
   * @param {1|2|3} [options.speed]
   */
  focus(target, options) {
    return {
      type: IMT.SCENE_FOCUS,
      data: {
        target,
        options,
      },
    };
  }

  /**
   * @param {number} delay ms
   * @returns
   */
  wait(delay) {
    return {
      type: IMT.WAIT,
      data: {
        delay,
      },
    };
  }

  /**
   * @param {*[]} list
   */
  list(list) {
    return {
      type: IMT.LIST,
      data: {
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
