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
 * @property {{[key: string]: Motion}} motions
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
 */

/**
 * @type {Map<string, number>}
 */
const stampIdxMap = new Map();

export class IObject extends EventTarget {
  #resource;

  #name;

  #hitbox;

  #sprite;

  #motion;

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
  }) {
    super();
    this.#resource = resource;
    this.#name = name;
    this.x = x;
    this.y = y;
    this.z = z;
    this.#hitbox = hitbox;
    this.#sprite = sprite;
    this.#motion = 'base';
    this.#portraits = portraits;
    this.direction = direction ?? 'down';
    const stampIdx = (stampIdxMap.get(resource) ?? 0) + 1;
    stampIdxMap.set(resource, stampIdx);
    this.serial = `${resource}:${stampIdx}`;
  }

  get name() {
    return this.#name;
  }

  get hitbox() {
    if (!this.#hitbox) {
      return null;
    }
    return {
      ...this.#hitbox,
      x: this.x + this.#hitbox.x,
      y: this.y + this.#hitbox.y,
      z: this.z,
    };
  }

  /**
   * @param {string} next
   */
  set motion(next) {
    if (!Object.keys(this.#sprite.motions).includes(next)) {
      throw new Error('no motion.');
    }
    this.#motion = next;

  }

  /**
   * @param {'interact' | 'press'} type
   * @param {() => void} callback
   */
  addEventListener(type, callback) {
    super.addEventListener(type, callback);
  }

  toJSON() {
    return {
      resource: this.#resource,
      serial: this.serial,
      name: this.name,
      x: this.x,
      y: this.y,
      z: this.z,
      motion: this.#motion,
      direction: this.direction,
      sprite: this.#sprite,
      portraits: this.#portraits,
    };
  }
}

/**
 * @typedef {IObject} IObjectType
 */

/**
 * @typedef {ReturnType<IObject['toJSON']>} IObjectJSON
 */
