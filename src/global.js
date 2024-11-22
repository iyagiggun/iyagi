/**
 * @typedef {Object} Sender
 * @property {(data: any) => void} send
 */

/**
 * @typedef {Object} GlobalParams
 * @property {(data: *) => void} send
 * @property {import('./scene/index.js').default[]} scenes
 */

/**
 * @type {Sender | undefined}
 */
let sender;

/**
 * @type {import('./scene/index.js').default[]}
 */
let scenes = [];

const ERR_NOT_INITED = 'receiver has not been initialized yet.';

export default {
  get sender() {
    if (!sender) {
      throw new Error(ERR_NOT_INITED);
    }
    return sender;
  },
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
    send,
    scenes: _scenes,
  }) {
    sender = {
      send,
    };
    scenes = _scenes;
  },
};
