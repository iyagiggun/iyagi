import { ObjectConverter } from './converter.js';
import { Portrait } from './portrait.js';
import ITexture from './texture.js';

/**
 * @typedef SpriteImage
 * @property {string} url
 * @property {number} [scale]
 */

/**
 * @typedef ActionArea
 * @property {SpriteImage} [image]
 * @property {import('@iyagi/commons/coords').Area[]} frames
 */

/**
 * @typedef Motion
 * @property {SpriteImage} [image]
 * @property {boolean} [loop]
 * @property {number | Object<number, number>} [fps]
 * @property {ActionArea} [up]
 * @property {ActionArea} [down]
 * @property {ActionArea} [left]
 * @property {ActionArea} [right]
 * @property {boolean=} playing
 */

/**
 * @typedef SpriteInfo
 * @property {SpriteImage} [image]
 * @property {import('@iyagi/commons/coords').Area} [shadow]
 * @property {{[key: string]: Motion}} [motions]
 */

/**
 * @typedef ClientObjectResourceParams
 * @property {string} [name]
 * @property {SpriteInfo} sprite
 */

/**
 * @type {Map<string, import('./index.js').default>}
 */
const pool = new Map();

class ObjectResource {
  #params;

  #texture;

  /**
   * @param {ClientObjectResourceParams} params
   */
  constructor(params) {
    this.#params = params;
    this.#texture = new ITexture(params.sprite);
  }

  async load() {
    await this.#texture.load();
    return this;
  }

  /**
   * @param {string} id
   * @param {{
   *  name?: string
   *  portraits?: string | { [key: string]: string }
   * }} [options]
   * @returns
   */
  stamp(id, options) {
    const cached = pool.get(id);
    if (cached) {
      return cached;
    }
    const created = ObjectConverter.convert({
      id,
      name: options?.name,
      texture: this.#texture,
      info: this.#params.sprite,
      // todo: json
      portrait: new Portrait(options?.portraits),
    });
    pool.set(id, created);
    return created;
  }
}

/**
 * @typedef {ObjectResource} ObjectResourceType
 */

export default ObjectResource;
