import { ClientObjectClass } from './index.js';
import { Portrait } from './portrait.js';
import ITexture from './texture.js';

/**
 * @type {Map<string, import('./index.js').default>}
 */
const pool = new Map();

class ObjectResource {
  #sprite;

  #texture;

  /**
   * @param {ReturnType<import('@iyagi/server/object').ServerObjectResourceType['toClientData']>['sprite']} sprite
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
    const created = new (ClientObjectClass.get())({
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
