import { IMT } from '../const/message.js';
import global from '../global.js';

/**
 * @typedef {Object} SceneParams
 * @property {string} key
 * @property {ReturnType<import('../object/index.js').default["at"]>[]} objects
 */

export default class Scene {
  objects;

  /**
   * @param {SceneParams} p
   */
  constructor({
    key,
    objects,
  }) {
    this.key = key;
    this.objects = objects;
  }

  /**
   * @param {import('../user/index.js').User} user
   */
  onLoad(user) {
    user.scene = this.key;
    user.objects = JSON.parse(JSON.stringify(this.objects));
    global.sender.send({
      type: IMT.SCENE_LOAD,
      data: { objects: [...this.objects] },
    });
  }

  fffff () {
    console.error(this.key);
  }

}
