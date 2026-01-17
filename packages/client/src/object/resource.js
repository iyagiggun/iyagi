import { ObjectConverter } from './converter.js';
import { Portrait } from './portrait.js';
import ITexture from './texture.js';

/**
 * @typedef SpriteImage
 * @property {string} url
 * @property {number} [scale]
 */

/**
 * @typedef {{
 *  image?: SpriteImage
 *  offset?: import('@iyagi/commons').XY
 *  frames: import('@iyagi/commons/coords').Area[]
 * }} ActionArea
 */

/**
 * @typedef {{
 *  image?: SpriteImage;
 *  offset?: import('@iyagi/commons').XY
 *  loop?: boolean
 *  fps?: number | Object<number, number>
 *  up?: ActionArea
 *  down?: ActionArea
 *  left?: ActionArea
 *  right?: ActionArea
 *  playing?: boolean
 * }} Motion
 */

/**
 * @typedef {{
 *  offset?: import('@iyagi/commons').XY
 *  shadow?: import('@iyagi/commons').Area
 *  motions: {
 *   [key: string]: Motion
 *  }
 * }} SpriteInfo
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
  #sprite;

  #texture;

  /**
   * @param {import('@iyagi/server/object/resource.js').ObjectResourceData['sprite']} sprite
   */
  constructor(sprite) {
    this.#sprite = sprite;
    this.#texture = new ITexture(sprite);
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
  spawn(id, options) {
    const cached = pool.get(id);
    if (cached) {
      return cached;
    }
    const created = ObjectConverter.convert({
      id,
      name: options?.name,
      texture: this.#texture,
      sprite: this.#sprite,
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
