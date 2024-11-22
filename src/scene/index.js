import { IMT } from '../const/message.js';
import global from '../global.js';

/**
 * @typedef {Object} Object
 * @property {string} name
 * @property {import('../coords/index.js').Area=} hitbox
 * @property {import('../coords/index.js').Position} position
 */

/**
 * @typedef {Object} SceneParams
 * @property {string} key
 * @property {Object[]} objects
 * @property {function(): *} onLoaded
 */

export default class Scene {
  objects;

  /**
   * @param {SceneParams} p
   */
  constructor({
    key,
    objects,
    onLoaded,
  }) {
    this.key = key;
    this.objects = objects;
    this.onLoaded = onLoaded;
  }
}

/**
 * @param {Object} p
 * @param {import('../user/index.js').User} p.user
 * @param {string} p.type
 * @param {*} p.data
 * @returns
 */
export const onSceneEvent = ({ user, type, data }) => {
  switch(type) {
    case IMT.SCENE_LOAD:
    {
      const scene = global.scene.find(data.scene);
      user.scene = scene.key;
      user.objects = JSON.parse(JSON.stringify(scene.objects));
      global.sender.send({
        type: IMT.SCENE_LOAD,
        data: { objects: [...scene.objects] },
      });
      return;
    }
    case IMT.SCENE_LOADED:
    {
      const scene = global.scene.find(data.scene);
      global.sender.send(scene.onLoaded());
    }
  }
};
