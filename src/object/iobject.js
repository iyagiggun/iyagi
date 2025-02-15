import { IObjectMessage } from './message.js';

/**
 * @typedef {import("../coords/index.js").Direction} Direction
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
 * @property {import('../coords/index.js').XY} [offset]
 * @property {import('../coords/index.js').Area[]} frames
 */

/**
 * @typedef Motion
 * @property {SpriteImage} [image]
 * @property {import('../coords/index.js').XY} [offset]
 * @property {boolean} [loop]
 * @property {ActionArea} [up]
 * @property {ActionArea} [down]
 * @property {ActionArea} [left]
 * @property {ActionArea} [right]
 * @property {boolean=} playing
 */

/**
 * @typedef SpriteInfo
 * @property {SpriteImage} [image]
 * @property {import('../coords/index.js').XY} [offset]
 * @property {{[key: string]: Motion}} [motions]
 */

/**
 * @typedef {string | Object<string, string>} Portraits
 */

/**
 * @typedef {Object} IObjectParams
 * @property {string=} name
 * @property {Direction=} direction
 * @property {Area=} hitbox
 * @property {SpriteInfo} sprite
 * @property {Portraits=} portraits
 * @property {function(import('../user/index.js').User): void=} interact
 */

/**
 * @type {Map<string, number>}
 */
const stampIdxMap = new Map();

export class IObject {
  #resource;

  #name;

  #hitbox;

  #interact;

  #sprite;

  #portraits;

  serial;

  /**
   * @param {string} resource,
   * @param {import('../coords/index.js').XYZ & {
   *  name?: string;
   *  direction?: Direction;
   *  hitbox?: Area;
   *  sprite: SpriteInfo;
   *  portraits?: Portraits;
   *  interact?: (user: import('../user/index.js').UserType) => void;
   * }} p
   */
  constructor(resource, {
    name,
    x,
    y,
    z,
    direction,
    hitbox,
    sprite,
    portraits,
    interact,
  }) {
    this.#resource = resource;
    this.#name = name;
    this.x = x;
    this.y = y;
    this.z = z;
    this.#hitbox = hitbox;
    this.#sprite = sprite;
    this.#portraits = portraits;
    this.direction = direction ?? 'down';
    this.#interact = interact;
    const stampIdx = (stampIdxMap.get(resource) ?? 0) + 1;
    stampIdxMap.set(resource, stampIdx);
    this.message = new IObjectMessage(this);
    this.serial = `${resource}:${stampIdx}`;
  }

  get key() {
    return this.serial;
  }

  get name() {
    return this.#name;
  }

  get hitbox() {
    if (!this.#hitbox) {
      return null;
    }
    return {
      key: this.#resource,
      ...this.#hitbox,
      x: this.x + this.#hitbox.x,
      y: this.y + this.#hitbox.y,
      z: this.z,
    };
  }

  get interact() {
    return this.#interact;
  }

  toJSON() {
    return {
      resource: this.#resource,
      serial: this.serial,
      name: this.name,
      x: this.x,
      y: this.y,
      z: this.z,
      direction: this.direction,
      sprite: this.#sprite,
      portraits: this.#portraits,
    };
  }
}

/**
 * @typedef {IObject} IObjectType
 */
