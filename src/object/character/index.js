import { Assets } from 'pixi.js';
import { TRANSPARENT_1PX_IMG } from '../../utils';
import IObject from '../base';

/**
 * @typedef
 */

/**
 * @typedef {Object} AdditionalParameter
 * @property {Object<string, string>} [AdditionalParameter.photoMap]
 * - The required property with the key "default"
 */

/**
 * @typedef {import('../base').IObjectParameter & AdditionalParameter} ICharacterParameter
 */

class ICharacter extends IObject {
  #p;

  /** @type {Object<string, import("pixi.js").Texture>} */
  #photoTextureMap = {};

  /**
   * @param {ICharacterParameter} p
   */
  constructor(p) {
    super(p);
    this.#p = p;
  }

  async load() {
    const photoMap = this.#p.photoMap ?? { default: TRANSPARENT_1PX_IMG };
    const photoLoadPromises = Object.keys(photoMap).map(async (photoKey) => {
      const photoUrl = photoMap[photoKey];
      const texture = await Assets.load(photoUrl);
      this.#photoTextureMap[photoKey] = texture;
    });
    await Promise.all([super.load(), ...photoLoadPromises]);
  }

  /**
   * @param {string} [key]
   */
  getPhotoTexture(key) {
    return this.#photoTextureMap[key ?? 'default'];
  }
}

export default ICharacter;
