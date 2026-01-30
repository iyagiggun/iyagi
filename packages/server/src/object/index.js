import { Subject } from 'rxjs';
import { ServerObjectResource } from './resource.js';
import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { NAI } from './NAI/index.js';
import { getDirectionByDelta } from '@iyagi/commons/coords';

/**
 * @typedef {import("@iyagi/commons/coords").Direction} Direction
 */


const MOTION_BASE = 'base';
const DIRECTION_DEFAULT = 'down';
const DEFAULT_MOVE_SPEED = 64;
const MOVE_TIME_UNIT = 1000; // 1sec

/**
 * @type {Map<string, number>}
 */
const instanceIdxMap = new Map();

/**
 * @typedef {Object} ServerObjectOptions
 * @property {string} [name]
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

  #x = 0;

  #y = 0;

  #z = 1;

  #moveSpeed = DEFAULT_MOVE_SPEED; // pixels per second

  /**
   * @param {ServerObjectResource} r
   * @param {ServerObjectOptions} [o]
   */
  constructor(r, o) {
    this.#name = o?.name;
    this.shape = r.data.shape;

    this.resource = r;
    // TODO:: sprite 는 없어져야 함
    this.#sprite = r.data.sprite;

    const idx = instanceIdxMap.get(r.key) ?? 0;
    this.#id = `object:${r.key}:${idx}`;
    instanceIdxMap.set(r.key, idx + 1); // set next index

    if (o?.direction) {
      this.#direction = o.direction;
    }
    this.#absHitbox = this.#calcAbsHitbox();
    this.#portraits = o?.portraits;

    /**
     * @type {Subject<import('../user/index.js').UserType>}
     */
    this.interaction$ = new Subject();

    /**
     * @type {Subject<import('../user/index.js').UserType>}
     */
    this.pressed$ = new Subject();

    /**
     * @type {Subject<{ user: import('../user/index.js').UserType, input: string }>}
     */
    this.action$ = new Subject();

    /**
     * @type {Subject<import('../shard/index.js').ShardType>}
     */
    this.impulse$ = new Subject();
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
      x: this.#x,
      y: this.#y,
      z: this.#z,
    };
  }

  /**
   * @readonly
   */
  get xyz() {
    return { x: this.#x, y: this.#y, z: this.#z };
  }

  /**
   * @readonly
   * @return {import('@iyagi/commons/coords').Area}
   */
  get area() {
    if ('radius' in this.shape) {
      return {
        x: this.#x,
        y: this.#y,
        radius: this.shape.radius,
      };
    }
    if ('halfW' in this.shape && 'halfH' in this.shape) {
      const { halfW, halfH } = this.shape;
      return {
        left: this.#x - halfW,
        right: this.#x + halfW,
        top: this.#y - halfH,
        bottom: this.#y + halfH,
      };
    }
    throw new Error('invalid shape');
  }

  get direction() {
    return this.#direction;
  }

  set direction(next) {
    if (this.#direction === next) {
      return;
    }
    this.#direction = next;
    // this.#absHitbox = this.#calcAbsHitbox();
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
      x: this.#x + w / 2,
      y: this.#y + h / 2,
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

  toClientData() {
    return {
      resource: this.resource.key,
      id: this.id,
      name: this.name,
      ...this.xyz,
      motion: this.#motion,
      direction: this.#direction,
      portraits: this.#portraits,
    };
  }

  /**
   * @param {object} param0
   * @param {number} param0.angle
   * @param {number} param0.duration ms
   */
  calcNextPos({ angle, duration }) {
    const distance = this.#moveSpeed * duration / MOVE_TIME_UNIT;
    return {
      x: this.#x + Math.cos(angle) * distance,
      y: this.#y + Math.sin(angle) * distance,
    };
  }

  /**
   * @param {object} param
   * @param {number} [param.x]
   * @param {number} [param.y]
   * @param {number} [param.z]
   * @param {import('@iyagi/commons/coords').Direction} [param.direction]
   * @param {boolean} [param.instant]
   * @param {boolean} [param.cutscene]
   * @param {number} [param.speed]
   * @returns {import('../const/index.js').ServerMessage}
   */
  move({ x, y, z, direction, instant, cutscene, speed: _speed }) {
    const lastXYZ = this.xyz;
    let diffX = 0;
    let diffY = 0;

    if (typeof x === 'number') {
      this.#x = x;
      diffX = x - lastXYZ.x;
    }

    if (typeof y === 'number') {
      this.#y = y;
      diffY = y - lastXYZ.y;
    }

    if (typeof z === 'number') {
      this.#z = z;
    }

    const speed = _speed ?? 1;

    const moveDirection = getDirectionByDelta(lastXYZ, this.xyz);

    const now = performance.now();
    const distance = Math.hypot(diffX, diffY);
    const duration = instant ? 0 : (1000 * distance) / (this.#moveSpeed * speed);
    const endTime = now + duration;
    const extra = cutscene || duration === 0 ? { duration } : { endTime };

    this.direction = direction || (instant || !this.canDirectTo(moveDirection) ? this.direction : moveDirection);
    /**
     * @type {import('../const/index.js').ServerMessage}
     */
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_MOVE,
      data: {
        target: this.id,
        ...this.xyz,
        direction: this.direction,
        ...extra,
        speed,
      },
    };
  }

  /**
   * @param {string[]} messages
   * @return {import('../const/index.js').ServerMessage}
   */
  talk(...messages) {
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_TALK,
      data: {
        target: this.id,
        message: messages,
      },
    };
  }
}

export { ServerObjectResource };
export { NAI };

/**
 * @typedef { ServerObject } ServerObjectType
 */
