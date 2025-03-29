import { IMT } from '../../const/message.js';
import { IObject } from '../../object/index.js';

export class ShardCameraMessage {
  #objects;

  /**
   * @param {import('../../object/iobject.js').IObject[]} objects
   */
  constructor(objects) {
    this.#objects = objects;
  }

  /**
   * @param {IObject | import('../../coords/index.js').XY} target
   * @param {Object} [options={}]
   * @param {1|2|3} [options.speed]
   */
  focus(target, options) {
    const xy = target instanceof IObject ? target.center() : target;
    return {
      type: IMT.CAMERA_FOCUS,
      data: {
        ...xy,
        ...options,
      },
    };
  }

}
