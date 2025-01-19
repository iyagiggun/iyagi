/**
 * @typedef {import("../coords/index.js").Direction} Direction
 * @typedef {import("../coords/index.js").Position} Position
 * @typedef {import("../coords/index.js").Area} Area
 */

/**
 * @typedef SpriteImage
 * @property {string} url
 * @property {number} [scale]
 */

/**
 * @typedef ActionArea
 * @property {SpriteImage} [image]
 * @property {import('../coords/index.js').Position} [offset]
 * @property {import('../coords/index.js').Area[]} frames
 */

/**
 * @typedef Motion
 * @property {SpriteImage} [image]
 * @property {import('../coords/index.js').Position} [offset]
 * @property {boolean} [loop]
 * @property {ActionArea} [up]
 * @property {ActionArea} [down]
 * @property {ActionArea} [left]
 * @property {ActionArea} [right]
 */

/**
 * @typedef SpriteInfo
 * @property {SpriteImage} [image]
 * @property {import('../coords/index.js').Position} [offset]
 * @property {Motion} base
 * @property {{[key: string]: Motion}} [actions]
 */

/**
 * @typedef {string | Object<string, string>} Portraits
 */

/**
 * @typedef {Object} IObjectParams
 * @property {string=} name
 * @property {Position} position
 * @property {Direction=} direction
 * @property {Area=} hitbox
 * @property {SpriteInfo} sprite
 * @property {Portraits=} portraits
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

  #sprite;

  #portraits;

  /**
   * @param {string} key,
   * @param {IObjectParams} p
   */
  constructor(key, {
    name,
    position,
    direction,
    hitbox,
    sprite,
    portraits,
    interact,
  }) {
    this.#key = key;
    this.#name = name;
    this.#x = position.x;
    this.#y = position.y;
    this.#z = position.z ?? 1;
    this.#hitbox = hitbox;
    this.#sprite = sprite;
    this.#portraits = portraits;
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
    return {
      key: this.key,
      name: this.name,
      position: this.position,
      sprite: this.#sprite,
      portraits: this.#portraits,
    };
  }
}
