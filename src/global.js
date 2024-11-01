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
  get scenes() {
    if (!scenes) {
      throw new Error(ERR_NOT_INITED);
    }
    return scenes;
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
