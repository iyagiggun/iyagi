import ServerObjectMessage from './Message.js';

/**
 * hitbox: It is difficult for the client to calculate zIndex when there are multiple hitboxes.
 */

export default class SObject {
  /**
   * @param {Object} p
   * @param {string} p.name
   * @param {import('../coords/index.js').Area=} p.hitbox
   * @param {boolean=} p.clone
   */
  constructor({
    name,
    hitbox,
    clone = false,
  }) {
    this.name = name;
    this.hitbox = hitbox;
    this.position = { x: 0, y: 0, z: 1 };
    this.message = new ServerObjectMessage(this.name);
    this.clone = clone;
  }

  /**
   * @param {import('../coords/index.js').Position} p
   */
  at(p) {
    this.position.x = p.x;
    this.position.y = p.y;
    if (typeof p.z === 'number') {
      this.position.z = p.z;
    }
    return {
      name: this.name,
      hitbox: this.hitbox,
      position: {
        ...p,
        z: p.z ?? 1,
      },
      clone: this.clone,
    };
  }
}
