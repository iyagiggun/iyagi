import ServerObjectMessage from './Message.js';
import IObject from './iobject.js';

/**
 * hitbox: It is difficult for the client to calculate zIndex when there are multiple hitboxes.
 */

/**
 * @typedef {import('../coords/index.js').Position} Position
 */

/**
 * @typedef {Object} SObjectParams
 * @property {string} p.key
 * @property {string=} p.name
 * @property {import('../coords/index.js').Area=} p.hitbox
 * @property {function(import('../user/index.js').default): void=} interact
 */

export default class ObjectResource {
  #key;

  #name;

  #hitbox;
  /**
   * @param {SObjectParams} p
   */
  constructor({
    key,
    name,
    hitbox,
  }) {
    this.#key = key;
    this.#name = name;
    this.message = new ServerObjectMessage(this.#key);

    this.#hitbox = hitbox;
  }

  /**
   * @param {import('./iobject.js').IObjectParams | Position} stampParam
   */
  stamp(stampParam) {
    const params = 'position' in stampParam ? stampParam : { position: stampParam };
    const obj = new IObject(this.#key, {
      name: this.#name,
      hitbox: this.#hitbox,
      ...params,
    });
    return obj;
  }
}
