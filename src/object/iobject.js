/**
 * @typedef {import("../coords/index.js").Direction} Direction
 * @typedef {import("../coords/index.js").Area} Area
 */

import { Subject } from 'rxjs';

/**
 * @typedef SpriteImage
 * @property {string} url
 * @property {number} [scale]
 */

/**
 * @typedef ActionArea
 * @property {SpriteImage} [image]
 * @property {Area} [hitbox]
 * @property {import('../coords/index.js').Area[]} frames
 */

/**
 * @typedef Motion
 * @property {SpriteImage} [image]
 * @property {Area} [hitbox]
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
 * @property {Area} [hitbox]
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

const MOTION_BASE = 'base';
const DIRECTION_DEFAULT = 'down';

export class IObject {
  #resource;

  #name;

  #hitbox;

  #sprite;

  #motion = MOTION_BASE;

  /** @type {Direction} */
  #direction = DIRECTION_DEFAULT;

  #portraits;

  serial;

  /**
   * @param {string} resource,
   * @param {import('../coords/index.js').XYZ & {
   *  name?: string;
   *  direction?: Direction;
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
    sprite,
    portraits,
  }) {
    this.#resource = resource;
    this.#name = name;
    this.#sprite = sprite;
    this.x = x;
    this.y = y;
    this.z = z;
    if (direction) {
      this.#direction = direction;
    }
    this.#hitbox = this.#calcHitbox();
    this.#portraits = portraits;
    const stampIdx = (stampIdxMap.get(resource) ?? 0) + 1;
    stampIdxMap.set(resource, stampIdx);
    this.serial = `${resource}:${stampIdx}`;

    /**
     * @type {Subject<import('../teller/index.js').SubjectData>}
     */
    this.interact$ = new Subject();
  }

  /**
   * @readonly
   */
  get name() {
    return this.#name;
  }

  /**
   * @readonly
   */
  get hitbox() {
    return {
      ...this.#hitbox,
      x: this.x + this.#hitbox.x,
      y: this.y + this.#hitbox.y,
      z: this.z,
    };
  }

  get w() {
    return this.#hitbox.w;
  }

  get h() {
    return this.#hitbox.h;
  }

  get direction() {
    return this.#direction;
  }

  set direction(next) {
    if (this.#direction === next) {
      return;
    }
    this.#direction = next;
  }

  get clientX() {
    return this.x - this.#hitbox.x;
  }

  get clientY() {
    return this.y - this.#hitbox.y;
  }

  #calcHitbox() {
    const motion = this.#sprite.motions[this.#motion];
    const directedMotion = motion[this.#direction];
    const hitbox = directedMotion?.hitbox ?? motion.hitbox ?? this.#sprite.hitbox;
    if (hitbox) {
      return hitbox;
    }
    if (!directedMotion) {
      throw new Error('no directed motion.');
    }
    const { w, h } = directedMotion.frames[0];
    return {
      x: 0,
      y: 0,
      w,
      h,
    };
  }

  center() {
    const hitbox = this.hitbox;
    if (!hitbox){
      return {
        x: this.x,
        y: this.y,
      };
    }
    return {
      x: this.x + hitbox.w / 2,
      y: this.y + hitbox.h / 2,
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

  toLoadData() {
    return {
      resource: this.#resource,
      serial: this.serial,
      name: this.name,
      x: this.clientX,
      y: this.clientY,
      z: this.z,
      motion: this.#motion,
      direction: this.#direction,
      sprite: this.#sprite,
      portraits: this.#portraits,
    };
  }
}
