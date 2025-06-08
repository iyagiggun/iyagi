import { IMT } from '../../../const/message.js';
import { ShardForge } from '../forge.js';
import { ShardCameraMessage } from './camera.js';
import { ShardEffectMessage } from './effect.js';
import { ShardObjectMessage } from './object.js';

export class ShardMessage {
  /**
   * @param {{
   *  objects: import('../../../coords/index.js').IObject[]
   * }} p
   */
  constructor({
    objects,
  }) {
    this.common = ShardCommonMessage;
    this.camera = ShardCameraMessage;
    this.effect = ShardEffectMessage;
    this.object = new ShardObjectMessage(objects);
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
  },


  /**
   * @param {object} param
   * @param {import('../../../user/index.js').UserType} param.user
   * @param {string} param.shard
   * @returns
   */
  enter({ user, shard }) {
    user.shard = ShardForge.seek(shard);
    return this.list([
      {
        type: IMT.SHARD_CLEAR,
      },
      {
        type: IMT.SHARD_LOAD,
        data: {
          shard: {
            objects: user.shard.objects.map((o) => o.toLoadData()),
          },
        },
      },
    ]);
  },
};
