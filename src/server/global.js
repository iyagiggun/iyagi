
/**
 * @typedef {Object} GlobalParams
 * @property {import('./scene/index.js').default[]} scenes
 */


/**
 * @type {import('./scene/index.js').default[]}
 */
let scenes = [];

// const ERR_NOT_INITED = 'receiver has not been initialized yet.';

export default {
  scene: {
    /**
     * @param {string} key
     */
    find: (key) => {
      const scene = scenes.find((scene) => scene.key === key);
      if (!scene) {
        throw new Error(`Fail to load scene "${key}".`);
      }
      return scene;
    },
  },
  /**
   * @param {GlobalParams} p
   */
  init({
    scenes: _scenes,
  }) {
    scenes = _scenes;
  },
};
