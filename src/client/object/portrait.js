/**
 * @typedef {string | Object<string, string>} PortraitParams
 */

import { Assets, Sprite } from 'pixi.js';

export class Portrait {

  #params;

  /** @type {Map<string, Sprite> | undefined} */
  #textures;

  /**
   * @param {PortraitParams=} p 'default' key is required.
   */
  constructor(p) {
    this.#params = typeof p === 'string' ? { default: p } : p;
    /**
     * @type {Map<string, string>}
     */
  }

  async load() {
    if (this.#textures || !this.#params) {
      return;
    }
    const promises = Object.entries(this.#params)
      .map(async ([key, url]) => {
        return [key, new Sprite(await Assets.load(url))];
      });
    this.#textures = (await Promise.all(promises))
      .reduce((acc, [key, sprite]) => acc.set(key, sprite), new Map());
  }

  get(key = 'default') {
    if (!this.#params) {
      return null;
    }

    if (!this.#textures) {
      throw new Error('Fail to get portrait. Not loaded');
    }

    const sprite = this.#textures.get(key);
    if (!sprite) {
      throw new Error(`Fail to get portrait. No ${key}.`);
    }

    return sprite;
  }
}

/**
 * @typedef {Portrait} PortraitType
 */
