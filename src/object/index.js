import ServerObjectMessage from './Message.js';

export default class SObject {
  /**
   * @param {Object} p
   * @param {string} p.name
   * @param {import('../coords/index.js').Area[]=} p.hitboxes
   * @param {boolean=} p.clone
   */
  constructor({
    name,
    hitboxes = [],
    clone = false,
  }) {
    this.name = name;
    this.hitboxes = hitboxes;
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
      hitboxes: this.hitboxes,
      position: {
        ...p,
        z: p.z ?? 1,
      },
      clone: this.clone,
    };
  }
}
