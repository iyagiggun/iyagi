import { Subject } from 'rxjs';
import { ServerObjectResource } from './resource.js';
import { isOverlap } from '@iyagi/commons';

/**
 * @typedef {import("../../coords/index.js").Direction} Direction
 * @typedef {import("../../coords/index.js").Area} Area
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
 * @property {string | Object<string, string>} [portraits]
 */

export class ServerObject {
  /** @type {string | undefined} */
  #name;

  // hitbox 는 한 개가 맞음. 여러개면 object 의 z-index 처리가 매우 어려워짐
  #absHitbox;

  #sprite;

  #motion = MOTION_BASE;

  /** @type {Direction} */
  #direction = DIRECTION_DEFAULT;

  #portraits;

  #id;

  /**
   * @param {ServerObjectResource} r
   * @param {ServerObjectOptions} [o]
   */
  constructor(r, o) {
    this.#name = o?.name;
    this.resource = r;
    this.#sprite = r.data.sprite;
    this.x = o?.x ?? 0;
    this.y = o?.y ?? 0;
    this.z = o?.z ?? 1;

    const idx = instanceIdxMap.get(r.key) ?? 0;
    this.#id = `object:${r.key}:${idx}`;
    instanceIdxMap.set(r.key, idx + 1); // set next index

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

  /**
   * @param {{
   *  target: ServerObject;
   *  objects: ServerObject[];
   *  destination: import('@iyagi/commons').XY | import('@iyagi/commons').XYZ;
   * }} p
   */
  getNextXYZ({
    objects,
    destination,
  }) {
    const { x: curX, y: curY  } = this;
    const curZ = this.z;
    const destZ = 'z' in destination ? destination.z : curZ;
    const hitbox = this.hitbox;

    // if (!hitbox) {
    //   return { ...destination, z: destZ };
    // }

    let deltaX = destination.x - curX;
    let deltaY = destination.y - curY;

    const interval_length = Math.max(Math.abs(deltaX), Math.abs(deltaY));
    const intervalX = deltaX / interval_length;
    const intervalY = deltaY / interval_length;

    const canHit = objects.filter((o) => {
      if (o.id === this.id) {
        return false;
      }
      const oHitBox = o.hitbox;
      if (oHitBox.w === 0 || oHitBox.h === 0) {
        return false;
      }
      return o.z === curZ;
    });

    let step = 0;
    while (step < interval_length) {
      step++;
      const hitboxInStep = {
        ...hitbox,
        x: hitbox.x + Math.round(intervalX * step),
        y: hitbox.y + Math.round(intervalY * step),
      };

      const hit = canHit.find((o) => {
        return isOverlap(hitboxInStep, o.hitbox);
      });
      if (hit) {
        return {
          x: curX + Math.round(intervalX * (step - 1)),
          y: curY + Math.round(intervalY * (step - 1)),
          // is valid??
          z: destZ,
        };
      }
    }
    return { ...destination, z: destZ };
  };

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

  toClientData() {
    // eslint-disable-next-line no-unused-vars
    const { hitbox, ...clientSpriteData } = this.#sprite;
    return {
      resource: this.resource.key,
      id: this.id,
      name: this.name,
      ...this.getClientXYZ(),
      motion: this.#motion,
      direction: this.#direction,
      portraits: this.#portraits,
    };
  }
}

export { ServerObjectResource };
