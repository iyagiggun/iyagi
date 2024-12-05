import ServerObjectMessage from './Message.js';

/**
 * hitbox: It is difficult for the client to calculate zIndex when there are multiple hitboxes.
 */

/**
 * @typedef {Object} SObjectParams
 * @property {string} p.name
 * @property {import('../coords/index.js').Area=} p.hitbox
 * @property {import('../coords/index.js').Direction=} p.direction
 * @property {import('../coords/index.js').Position=} p.position
 * @property {boolean=} p.clone
 */

export default class SObject {
  #hitbox;
  /**
   * @param {SObjectParams} p
   */
  constructor({
    name,
    hitbox,
    direction = 'down',
    position = { x: 0, y: 0 },
    clone = false,
  }) {
    this.name = name;
    this.position = { ...position, z: position.z ?? 1 };
    this.direction = direction;
    this.message = new ServerObjectMessage(this.name);
    this.clone = clone;

    this.#hitbox = hitbox;
  }

  get hitbox() {
    if (!this.#hitbox) {
      return null;
    }
    return {
      ...this.#hitbox,
      x: this.position.x + this.#hitbox.x,
      y: this.position.y + this.#hitbox.y,
      z: this.position.z,
    };
  }

  set hitbox(_) {
    throw new Error(`Hitbox can not be set. target: ${this.name}`);
  }
}
