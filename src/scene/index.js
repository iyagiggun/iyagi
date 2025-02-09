/**
 * @typedef {Object} SceneParams
 * @property {string} key
 * @property {import('../object/index.js').IObject[]} objects
 * @property {function(import('../user/index.js').UserType): *} onLoaded
 */

export default class Scene {
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
