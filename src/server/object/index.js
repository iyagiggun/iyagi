import { Subject } from 'rxjs';

/**
 * @typedef {import("../../coords/index.js").Direction} Direction
 * @typedef {import("../../coords/index.js").Area} Area
 */

/**
 * @typedef SpriteImage
 * @property {string} url
 * @property {number} [scale]
 */

/**
 * @typedef ActionArea
 * @property {SpriteImage} [image]
 * @property {Area} [hitbox]
 * @property {import('../../coords/index.js').Area[]} frames
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
 * @typedef {Object} ServerObjectResource
 * @property {string} key
 * @property {SpriteInfo} sprite
 */

const MOTION_BASE = 'base';
const DIRECTION_DEFAULT = 'down';
const MAX_Z_INDEX = 999;

/**
 * @type {Map<string, number>}
 */
const instanceIdxMap = new Map();

/**
 * @typedef {Object} ServerObjectOptions
 * @property {string} [name]
 * @property {number} [x]
 * @property {number} [y]
 * @property {number} [z]
 * @property {Direction} [direction]
 * @property {Portraits} [portraits]
 */

export class ServerObject {
  #resource;

  /** @type {string | undefined} */
  #name;

  // hitbox 는 한 개가 맞음. 여러개이면 z-index 처리가 매우 어려워짐
  #absHitbox;

  #sprite;

  #motion = MOTION_BASE;

  /** @type {Direction} */
  #direction = DIRECTION_DEFAULT;

  #portraits;

  #id;

  /**
   * @param {ServerObjectResource} p
   * @param {ServerObjectOptions} [o]
   */
  constructor(p, o) {
    this.#name = o?.name;
    this.#sprite = p.sprite;
    this.x = o?.x ?? 0;
    this.y = o?.y ?? 0;
    this.z = o?.z ?? 1;

    const idx = instanceIdxMap.get(p.key) ?? 0;
    this.#id = `object:${p.key}:${idx}`;
    instanceIdxMap.set(p.key, idx + 1); // set next index

    this.#resource = p.key;
    if (o?.direction) {
      this.#direction = o.direction;
    }
    this.#absHitbox = this.#calcAbsHitbox();
    this.#portraits = o?.portraits;

    /**
     * @type {Subject<import('../const/index.js').ServerPayload>}
     */
    this.interaction$ = new Subject();

    /**
     * @type {Subject<import('../const/index.js').ServerPayload>}
     */
    this.pressed$ = new Subject();

    /**
     * @type {Subject<import('../const/index.js').ServerPayload & { input: string }>}
     */
    this.action$ = new Subject();
  }

  /**
   * @readonly
   */
  get id() {
    return this.#id;
  }

  set id(_) {
    throw new Error('object\'s id cannot be modified');
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
      ...this.#absHitbox,
      x: this.x,
      y: this.y,
      z: this.z,
    };
  }

  /**
   * @readonly
   */
  get w() {
    return this.#absHitbox.w;
  }

  /**
   * @readonly
   */
  get h() {
    return this.#absHitbox.h;
  }

  /**
   * @readonly
   */
  get xyz() {
    return { x: this.x, y: this.y, z: this.z };
  }

  get direction() {
    return this.#direction;
  }

  set direction(next) {
    if (this.#direction === next) {
      return;
    }
    this.#direction = next;
    this.#absHitbox = this.#calcAbsHitbox();
  }

  /**
   * @param {Direction} direction
   */
  canDirectTo(direction) {
    const motion = this.#sprite.motions[this.#motion];
    if (!motion) return false;
    return !!motion[direction];
  }

  #calcAbsHitbox() {
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
    const { w, h } = this.#absHitbox;
    return {
      x: this.x + w / 2,
      y: this.y + h / 2,
    };
  }

  get motion() {
    return this.#motion;
  }

  /**
   * @param {string} next
   */
  set motion(next) {
    if (!Object.keys(this.#sprite.motions).includes(next)) {
      throw new Error('no motion.');
    }
    this.#motion = next;
    this.#absHitbox = this.#calcAbsHitbox();
  }

  getClientXYZ() {
    const hitbox = this.hitbox;
    return {
      x: hitbox.x - this.#absHitbox.x,
      y: hitbox.y - this.#absHitbox.y,
      z: this.z * (MAX_Z_INDEX + 1) + hitbox.y + hitbox.h,
    };
  }

  toLoadData() {
    // eslint-disable-next-line no-unused-vars
    const { hitbox, ...clientSpriteData } = this.#sprite;
    return {
      resource: this.#resource,
      id: this.id,
      name: this.name,
      ...this.getClientXYZ(),
      motion: this.#motion,
      direction: this.#direction,
      sprite: clientSpriteData,
      portraits: this.#portraits,
    };
  }
}
