/**
 * @typedef {import("../coords/index.js").Direction} Direction
 * @typedef {import("../coords/index.js").Position} Position
 * @typedef {import("../coords/index.js").Area} Area
 */

/**
 * @typedef {Object} IObjectParams
 * @property {string=} name
 * @property {Position} position
 * @property {Direction=} direction
 * @property {Area=} hitbox
 * @property {function(import('../user/index.js').default): void=} interact
 */

export default class IObject {
  #key;

  #name;

  #x;

  #y;

  #z;

  #hitbox;

  /** @type {Direction} */
  #direction;

  #interact;

  /**
   * @param {string} key,
   * @param {IObjectParams} p
   */
  constructor(key, {
    name,
    position,
    direction,
    hitbox,
    interact,
  }) {
    this.#key = key;
    this.#name = name;
    this.#x = position.x;
    this.#y = position.y;
    this.#z = position.z ?? 1;
    this.#hitbox = hitbox;
    this.#direction = direction ?? 'down';
    this.#interact = interact;
  }

  get key() {
    return this.#key;
  }

  get name() {
    return this.#name;
  }

  get position() {
    return {
      x: this.#x,
      y: this.#y,
      z: this.#z,
    };
  }

  /**
   * @param {Position} pos
   */
  set position(pos) {
    this.#x = pos.x;
    this.#y = pos.y;
    this.#z = pos.z ?? this.#z ?? 0;
  }

  get direction() {
    return this.#direction;
  }

  /**
   * @param {Direction} dir
   */
  set direction(dir) {
    this.#direction = dir;
  }

  get hitbox() {
    if (!this.#hitbox) {
      return null;
    }
    return {
      key: this.#key,
      ...this.#hitbox,
      x: this.#x + this.#hitbox.x,
      y: this.#y + this.#hitbox.y,
      z: this.#z,
    };
  }

  get interact() {
    return this.#interact;
  }

  toJSON() {
    return { key: this.key, name: this.name, position: this.position };
  }
}
