
/**
 * @typedef SpriteImage
 * @property {string} url
 * @property {number} [scale]
 */

/**
 * @typedef ActionArea
 * @property {SpriteImage} [image]
 * @property {import('../../commons/coords.js').Area} [hitbox]
 * @property {import('../../commons/coords.js').Area[]} frames
 */

/**
 * @typedef Motion
 * @property {SpriteImage} [image]
 * @property {import('../../commons/coords.js').Area} [hitbox]
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
 * @property {{[key: string]: Motion}} motions
 */

/**
 * @type {Set<string>}
 */
const RESOURCE_KEY_SET = new Set();

export class ServerObjectResource {
  #key;
  #sprite;
  /**
   * @param {string} key 
   * @param {SpriteInfo} sprite 
   */
  constructor(key, sprite) {
    if (RESOURCE_KEY_SET.has(key)) {
      throw new Error(`Resource key "${key}" already exists.`);
    }
    RESOURCE_KEY_SET.add(key);
    this.#key = key;
    this.#sprite = sprite;
  }

  get key() {
    return this.#key;
  }

  get sprite() {
    return this.#sprite;
  }
}