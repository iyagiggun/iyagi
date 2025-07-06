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
 * @property {import('../../commons/coords.js').Area[]} frames
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
 * @property {import('../../commons/coords.js').Area} [shadow]
 * @property {{[key: string]: Motion}} [motions]
 */

/**
 * @typedef ClientObjectResourceParams
 * @property {string} key
 * @property {string} [name]
 * @property {SpriteInfo} sprite
 * @property {import('./portrait.js').PortraitParams=} portraits
 */

/**
 * @type {Map<string, import('./index.js').default>}
 */
const pool = new Map();

class ObjectResource {
  #params;

  #texture;

  #portrait;

  #key;

  /**
   * @param {string} key
   * @param {ClientObjectResourceParams} params
   */
  constructor(key, params) {
    this.#params = params;
    this.#key = key;
    this.#texture = new ITexture(params.sprite);
    this.#portrait = new Portrait(params.portraits);
  }

  async load() {
    await Promise.all([this.#texture.load(), this.#portrait.load()]);
    return this;
  }

  /**
   * @param {string=} id
   * @returns
   */
  stamp(id) {
    const cached = pool.get(id);
    if (cached) {
      return cached;
    }
    console.error(ObjectConverter.convert);
    const created = ObjectConverter.convert({
      id,
      name: this.#params.name,
      texture: this.#texture,
      info: this.#params.sprite,
      portrait: this.#portrait,
    });
    pool.set(id, created);
    return created;
  }

  set key(_) {
    throw new Error('The key cannot be edited');
  }

  get key() {
    return this.#key;
  }
}

/**
 * @typedef {ObjectResource} ObjectResourceType
 */

export default ObjectResource;
