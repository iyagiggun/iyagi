import { IMT } from '../../const/message.js';
import { ShardCameraMessage } from './camera.js';
import { ShardObjectMessage } from './object.js';

export class ShardMessage {
  /**
   * @param {{
   *  objects: import('../../coords/index.js').IObject[]
   * }} p
   */
  constructor({
    objects,
  }) {
    this.common = ShardCommonMessage;
    this.camera = new ShardCameraMessage(objects);
    this.object = new ShardObjectMessage(objects);
    // this.scene = new ShardSceneMessage(objects);
  }
}

const ShardCommonMessage = {
  /**
   * @param {number} delay ms
   */
  wait(delay) {
    return {
      type: IMT.WAIT,
      data: {
        delay,
      },
    };
  },

  // /**
  //  * @param {*[]} list
  //  */
  // list(list) {
  //   return {
  //     type: IMT.LIST,
  //     data: {
  //       list,
  //     },
  //   };
  // }

  // /**
  //  * @param {string} target
  //  */
  // control(target) {
  //   return {
  //     type: IMT.SCENE_CONTROL,
  //     data: {
  //       target,
  //     },
  //   };
  // }
};
