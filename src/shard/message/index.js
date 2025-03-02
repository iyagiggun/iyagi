import { ShardObjectMessage } from './object.js';
import { ShardSceneMessage } from './scene.js';

export class ShardMessage {
  /**
   * @param {{
   *  objects: import('../../object/iobject.js').IObjectType[]
   * }} p
   */
  constructor({
    objects,
  }) {
    this.object = new ShardObjectMessage(objects);
    this.scene = new ShardSceneMessage(objects);
  }
}
