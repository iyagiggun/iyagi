import ServerObjectMessage from './Message.js';
import { IObject } from './iobject.js';

/**
 * hitbox: It is difficult for the client to calculate zIndex when there are multiple hitboxes.
 */

/**
 * @typedef {import('../coords/index.js').Position} Position
 */

/**
 * @typedef {Object} SObjectParams
 * @property {string} key
 * @property {string=} name
 * @property {import('../coords/index.js').Area=} hitbox
 * @property {import('./iobject.js').SpriteInfo} sprite
 * @property {import('./iobject.js').Portraits=} portraits
 * @property {function(import('../user/index.js').default): void=} interact
 */

export default class ObjectResource {
  #key;

  #name;

  #hitbox;

  #sprite;

  #portraits;
  /**
   * @param {SObjectParams} p
   */
  constructor({
    key,
    name,
    hitbox,
    sprite,
    portraits,
  }) {
    this.#key = key;
    this.#name = name;
    this.message = new ServerObjectMessage(this.#key);
    this.#hitbox = hitbox;
    this.#sprite = sprite;
    this.#portraits = portraits;
  }

  /**
   * @typedef {Object} StampParams
   * @property {Position} position
   * @property {import('../coords/index.js').Direction=} direction
   * @property {function(import('../user/index.js').default): void=} interact
   *
   * @param {StampParams | Position} params
   */
  stamp(params) {
    const additional = 'position' in params ? params : { position: params };
    const obj = new IObject(this.#key, {
      name: this.#name,
      hitbox: this.#hitbox,
      sprite: this.#sprite,
      portraits: this.#portraits,
      ...additional,
    });
    return obj;
  }
}


/**
 * @typedef {Object} MonoSpriteInfo
 * @property {string} image
 * @property {import('../coords/index.js').Position=} offset;
 * @property {import('../coords/index.js').Area[]} frames
 *
 * @typedef {Object} MonoObjectParams
 * @property {string} key
 * @property {string=} name
 * @property {import('../coords/index.js').Area=} hitbox
 * @property {MonoSpriteInfo} sprite
 * @property {import('./iobject.js').Portraits=} portraits
 * @property {function(import('../user/index.js').default): void=} interact
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
        offset: params.sprite.offset,
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
