import { IMT } from '../const/message.js';
import { getDirectionByDelta } from '../coords/index.js';
import { message } from '../message/index.js';

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

  /** @type {Direction} */
  #direction;

  #interact;

  #sprite;

  #portraits;

  stamped;

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
    this.#direction = direction ?? 'down';
    this.#interact = interact;
    const stampIdx = (stampIdxMap.get(resource) ?? 0) + 1;
    stampIdxMap.set(resource, stampIdx);
    this.stamped = `${resource}:${stampIdx}`;
  }

  get key() {
    return this.stamped;
  }

  get name() {
    return this.#name;
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
      key: this.#resource,
      ...this.#hitbox,
      x: this.x + this.#hitbox.x,
      y: this.y + this.#hitbox.y,
      z: this.z,
    };
  }

  /**
   * @param {(import('../coords/index.js').XYZ | import('../coords/index.js').XY) & {
   *  speed?: 1 | 2 | 3,
   *  shard: import('../shard/index.js').ShardType,
   *  direction?: Direction
   * }} info
   */
  move(info) {
    const t = info.shard.objects.find((obj) => obj.stamped === this.stamped);
    if (!t) {
      throw new Error('No object in the shard.');
    }
    const direction = info.direction ?? getDirectionByDelta(t, info);
    t.x = info.x;
    t.y = info.y;
    t.z = 'z' in info ? info.z : this.z;
    return {
      type: IMT.OBJECT_MOVE,
      data: {
        ...t,
        speed: info.speed,
        direction,
      },
    };
  }

  /**
   * @param {string | string[]} message
   */
  talk(message) {
    return {
      type: IMT.OBJECT_TALK,
      data: {
        stamped: this.stamped,
        message,
      },
    };
  }

  /**
   * @param {0 | 1 | 2 | 3} [speed] 0: instantly
   */
  focus(speed = 1) {
    const hitbox = this.hitbox;
    return message.focus({
      x: this.x + (hitbox ? hitbox.w/2 : 0),
      y: this.y + (hitbox ? hitbox.h/2 : 0),
      speed,
    });
  }

  control() {
    return {
      type: IMT.OBJECT_CONTROL,
      data: {
        stamped: this.stamped,
      },
    };
  }

  /**
   * @param {import('../shard/index.js').ShardType} shard
   */
  remove(shard) {
    const idx = shard.objects.findIndex((obj) => obj.key === this.key);
    if (idx > -1) {
      shard.objects.splice(idx, 1);
    }
    return {
      type: IMT.OBJECT_REMOVE,
      data: {
        stamped: this.stamped,
      },
    };
  }

  get interact() {
    return this.#interact;
  }

  toJSON() {
    return {
      resource: this.#resource,
      stamped: this.stamped,
      name: this.name,
      x: this.x,
      y: this.y,
      z: this.z,
      sprite: this.#sprite,
      portraits: this.#portraits,
    };
  }
}
