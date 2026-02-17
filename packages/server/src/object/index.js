import { Subject } from 'rxjs';
import { ServerObjectResource } from './resource.js';
import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { NAI } from './NAI/index.js';
import { FRAMES_PER_SECOND } from '../const/index.js';

/**
 * @typedef {import("@iyagi/commons/coords").Direction} Direction
 */

const MOTION_BASE = 'base';
const DIRECTION_DEFAULT = 'down';
const MOVE_TIME_UNIT = 1000; // 1sec

/**
 * @type {Map<string, number>}
 */
const instanceIdxMap = new Map();

/**
 * @typedef {Object} ServerObjectOptions
 * @property {string} [name]
 * @property {string} [key]
 * @property {string | Object<string, string>} [portraits]
 */

export class ServerObject {
  /** @type {string | undefined} */
  #name;

  #shape;

  #sprite;

  #motion = MOTION_BASE;

  /** @type {Direction} */
  #direction = DIRECTION_DEFAULT;

  #portraits;

  #id;

  x = 0;

  y = 0;

  z = 1;

  #moveSpeed = FRAMES_PER_SECOND; // pixels per second

  /**
   * @param {ServerObjectResource} r
   * @param {ServerObjectOptions} [o]
   */
  constructor(r, o) {
    this.#name = o?.name;
    this.#shape = r.data.shape;

    this.resource = r;
    // TODO:: sprite 는 없어져야 함
    this.#sprite = r.data.sprite;

    if (o?.key) {
      this.#id = o.key;
    } else {
      const idx = instanceIdxMap.get(r.key) ?? 0;
      this.#id = `object:${r.key}:${idx}`;
      instanceIdxMap.set(r.key, idx + 1); // set next index
    }

    this.#portraits = o?.portraits;

    /**
     * @type {Subject<{ user: import('../user/index.js').UserType }>}
     */
    this.interaction$ = new Subject();

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
   * @returns {import('@iyagi/commons/coords').XYZ}
   */
  get xyz() {
    return { x: this.x, y: this.y, z: this.z };
  }

  /**
   * @param {import('@iyagi/commons/coords').OptionalXYZ} p
   */
  set xyz({ x, y, z }) {
    if (typeof x === 'number') {
      this.x = x;
    }
    if (typeof y === 'number') {
      this.y = y;
    }
    if (typeof z === 'number') {
      this.z = z;
    }
  }

  /**
   * @readonly
   * @return {import('@iyagi/commons/coords').Area}
   */
  get area() {
    return {
      ...this.xyz,
      ...this.#shape,
    };
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
  }

  /**
   * @param {number} padding
   */
  getFrontXY(padding = 0) {
    if ('radius' in this.#shape) {
      const distance = this.#shape.radius;
      switch (this.#direction) {
        case 'up':
          return { x: this.x, y: this.y - distance - padding };
        case 'down':
          return { x: this.x, y: this.y + distance + padding };
        case 'left':
          return { x: this.x - distance - padding, y: this.y };
        case 'right':
          return { x: this.x + distance + padding, y: this.y };
        default:
          throw new Error('Invalid direction.');
      }
    }
    if ('halfW' in this.#shape && 'halfH' in this.#shape) {
      const { halfW, halfH } = this.#shape;
      switch (this.#direction) {
        case 'up':
          return { x: this.x, y: this.y - halfH - padding };
        case 'down':
          return { x: this.x, y: this.y + halfH + padding };
        case 'left':
          return { x: this.x - halfW - padding, y: this.y };
        case 'right':
          return { x: this.x + halfW + padding, y: this.y };
        default:
          throw new Error('Invalid direction.');
      }
    }
    throw new Error('invalid shape');
  }

  /**
   * @param {Direction} direction
   */
  canDirectTo(direction) {
    const motion = this.#sprite.motions[this.#motion];
    if (!motion) return false;
    return !!motion[direction];
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
   * @param {import('@iyagi/commons/coords').XY} param0.xy
   * @param {number} param0.duration ms
   */
  calcNextPos({ xy: { x, y }, duration }) {
    const distance = this.#moveSpeed * duration / MOVE_TIME_UNIT;
    const length = Math.hypot(x, y);
    const normalizedDx = length > 0 ? x / length : 0;
    const normalizedDy = length > 0 ? y / length : 0;
    return {
      x: this.x + normalizedDx * distance,
      y: this.y + normalizedDy * distance,
    };
  }

  /**
   * @param {Direction} direction
   * @returns {import('../const/index.js').ServerMessage}
   */
  direct(direction) {
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_MOVE,
      data: {
        target: this.id,
        ...this.xyz,
        direction,
        duration: 0,
        speed: 1,
      },
    };
  }

  getMovementSpeed() {
    return FRAMES_PER_SECOND;
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

  /**
   * @param {string} motion
   * @param {object} [options]
   * @param {number} [options.speed]
   */
  perform(motion, options = {}) {
    this.motion = motion;
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_ACTION,
      data: {
        target: this.id,
        motion,
        options: {
          speed: options.speed,
        },
      },
    };
  }
}

export { ServerObjectResource };
export { NAI };

/**
 * @typedef { ServerObject } ServerObjectType
 * @typedef { ServerObjectResource } ServerObjectResourceType
 */
