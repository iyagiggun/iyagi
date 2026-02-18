import ClientObject from './index.js';
import { Portrait } from './portrait.js';
import ITexture from './texture.js';

class ObjectResource {
  #key;

  #sprite;

  #texture;

  #loaded = false;

  /**
   * @type {Map<string, ObjectResource>}
   */
  static pool = new Map();

  /**
   * @param {string} key
   * @param {ReturnType<import('@iyagi/server/object').ServerObjectResourceType['toClientData']>['sprite']} sprite
   */
  constructor(key, sprite) {
    this.#key = key;
    this.#sprite = sprite;
    this.#texture = new ITexture(sprite);
  }

  async load() {
    if (this.#loaded) {
      return;
    }
    await this.#texture.load();
    this.#loaded = true;
    ObjectResource.pool.set(this.#key, this);
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
    return ClientObject.pool.get(id) ?? new ClientObject({
      id,
      name: options?.name,
      texture: this.#texture,
      sprite: this.#sprite,
      // todo: json
      portrait: new Portrait(options?.portraits),
    });
  }
}

/**
 * @typedef {ObjectResource} ObjectResourceType
 */

export default ObjectResource;
