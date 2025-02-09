import { IMT } from '../const/message.js';

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
   * @param {*} info
   */
  object(target, info) {
    const t = this.#shard.objects.find((each) => each.name === target.name);
    if (!t) {
      throw new Error(`No "${target.name}" in the shard.`);
    }
    console.error(t);
    return {
      type: IMT.SCENE_OBJECT,
      data: {
        target: t.name,
        ...info,
      },
    };
  }

  /**
   * @param {string | import('../coords/index.js').XY} target
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
