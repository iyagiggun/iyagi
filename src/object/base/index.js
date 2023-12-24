/**
 * @typedef {Object} IObjectParameter
 * @property {string} [name]
 * @property {Sprite} sprite
 * @property {number} [z]
 */

/**
 * @typedef {Object} Sprite
 * @property {string} url
 * @property {import('../../utils/coordinates').Area[]} [frames]
 * @property {import('../../utils/coordinates').Area} [hitbox]
 */

import { Container } from 'pixi.js';
import ISprite from '../../sprite';

const IObject = {
  /**
   * @param {IObjectParameter} p
   */
  create: (p) => {
    const container = new Container();

    let loaded = false;

    const isprite = ISprite.create(p.sprite.url, {
      frames: p.sprite.frames,
    });

    const ret = {
      name: p.name,
      container,
      isLoaded: () => loaded,
      load: () => isprite.load().then(() => {
        container.addChild(isprite.get());
        loaded = true;
      }),
    };

    return ret;
  },
};

export default IObject;
