
/**
 * @typedef SpriteImage
 * @property {string} url
 * @property {number} [scale]
 */

/**
 * @typedef ActionArea
 * @property {SpriteImage} [image]
 * @property {import('../../commons/coords.js').Area} [hitbox]
 * @property {import('../../commons/coords.js').Area} [shadow]
 * @property {import('../../commons/coords.js').Area[]} frames
 */

/**
 * @typedef Motion
 * @property {SpriteImage} [image]
 * @property {import('../../commons/coords.js').Area} [hitbox]
 * @property {import('../../commons/coords.js').Area} [shadow]
 * @property {boolean} [loop]
 * @property {ActionArea} [up]
 * @property {ActionArea} [down]
 * @property {ActionArea} [left]
 * @property {ActionArea} [right]
 * @property {boolean=} playing
 */

/**
 * @typedef SpriteInfo
 * @property {SpriteImage} [image]
 * @property {import('../../commons/coords.js').Area} [hitbox]
 * @property {import('../../commons/coords.js').Area} [shadow]
 * @property {{[key: string]: Motion}} motions
 */

/**
 * @typedef ObjectResourceData
 * @property {SpriteInfo} sprite
 */

/**
 * @type {Set<string>}
 */
const RESOURCE_KEY_SET = new Set();

export class ServerObjectResource {
  #key;
  /**
   * @param {string} key
   * @param {ObjectResourceData} data
   */
  constructor(key, data) {
    if (RESOURCE_KEY_SET.has(key)) {
      throw new Error(`Resource key "${key}" already exists.`);
    }
    RESOURCE_KEY_SET.add(key);
    this.#key = key;
    this.data = data;
  }

  get key() {
    return this.#key;
  }

  toClientData() {
    return {
      key: this.key,
      data: this.data,
    };
  }
}
