import { IObject } from './iobject.js';

/**
 * hitbox: It is difficult for the client to calculate zIndex when there are multiple hitboxes.
 */

/**
 * @typedef {Object} SObjectParams
 * @property {string} key
 * @property {string=} name
 * @property {import('../coords/index.js').Area=} hitbox
 * @property {import('./iobject.js').SpriteInfo} sprite
 * @property {import('./iobject.js').Portraits=} portraits
 */

export default class ObjectResource {
  #key;

  #name;

  #sprite;

  #portraits;
  /**
   * @param {SObjectParams} p
   */
  constructor({
    key,
    name,
    sprite,
    portraits,
  }) {
    this.#key = key;
    this.#name = name;
    this.#sprite = sprite;
    this.#portraits = portraits;
  }

  /**
   * @param { (import('../coords/index.js').XYZ | import('../coords/index.js').XY) & {
   *  direction?: import('../coords/index.js').Direction
   * }} info
   */
  stamp(info) {
    const obj = new IObject(this.#key, {
      name: this.#name,
      sprite: this.#sprite,
      portraits: this.#portraits,
      ...info,
      z: 'z' in info ? info.z : 1,
    });
    return obj;
  }
}


/**
 * @typedef {Object} MonoSpriteInfo
 * @property {string} image
 * @property {import('../coords/index.js').Area} [hitbox]
 * @property {import('../coords/index.js').Area[]} frames
 *
 * @typedef {Object} MonoObjectParams
 * @property {string} key
 * @property {string=} name
 * @property {MonoSpriteInfo} sprite
 * @property {import('./iobject.js').Portraits=} portraits
 */


export class MonoObjectResource extends ObjectResource {
  /**
   * @param {MonoObjectParams} params
   */
  constructor(params) {
    super({
      ...params,
      sprite: {
        image: {
          url: params.sprite.image,
        },
        hitbox: params.sprite.hitbox,
        motions: {
          base: {
            down: {
              frames: params.sprite.frames,
            },
          },
        },
      },
    });
  }
}
