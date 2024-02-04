import { Assets, Sprite } from 'pixi.js';
import { IObject } from '..';
import messanger from '../../scene/messenger';
import { TRANSPARENT_1PX_IMG } from '../../utils';

/**
 * @typedef {Object} AdditionalParameter
 * @property {Object<string, string>} [AdditionalParameter.photoMap]
 * - "default" key is required
 */

/**
 * @typedef {import('..').ObjectParameter & AdditionalParameter} CharacterParameter
 */

class ICharacter extends IObject {
  #photo = {
    key: 'default',
    /** @type {Object<string, import("pixi.js").Sprite>} */
    texture: {},
  };

  /** @type {CharacterParameter} */
  #p;

  /**
   * @param {CharacterParameter} p
   */
  constructor(p) {
    super(p);
    this.#p = p;
  }

  async load() {
    if (this.isLoaded()) {
      return;
    }
    const photoMap = this.#p.photoMap ?? { default: TRANSPARENT_1PX_IMG };
    const photoLoadPromises = Object.keys(photoMap).map(async (key) => {
      const photoUrl = photoMap[key];
      this.#photo.texture[key] = new Sprite(await Assets.load(photoUrl));
    });
    await Promise.all([super.load(), ...photoLoadPromises]);
  }

  /**
   * @param {string} message
   */
  talk(message) {
    return messanger.talk({
      speaker: this,
      message,
    });
  }

  photo() {
    return this.#photo.texture[this.#photo.key];
  }
}

export { ICharacter };
