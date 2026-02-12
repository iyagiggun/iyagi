import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { getDirectionByDelta } from '@iyagi/commons/coords';
import { Subject } from 'rxjs';
import { Fields } from '../field/fields.js';
/**
 * @typedef {{
 *  target: import('../object/index.js').ServerObject,
 *  before: import('@iyagi/commons/coords').XYZ,
 *  after: import('@iyagi/commons/coords').XYZ,
 * }} MovePayload
 */

export class Shard {
  /** @type {Subject<MovePayload>} */
  #move$ = new Subject();

  #key;

  /** @type {NodeJS.Timeout | null} */
  #tick_interval = null;

  /** @type {Set<import('../user/index.js').UserType>} */
  users = new Set();

  /**
   * @param {Object} p
   * @param {string} p.key
   * @param {import('../object/index.js').ServerObject[]} p.objects
   */
  constructor({
    key,
    objects,
  }) {
    this.#key = key;
    this.objects = objects;
    this.fields = new Fields(objects);

    /**
     * @type {Subject<import('../user/index.js').UserType>}
     */
    this.loaded$ = new Subject();

    /**
     * @type {Subject<import('../user/index.js').UserType>}
     */
    this.leave$ = new Subject();

    this.loaded$.subscribe((user) => {
      this.users.add(user);
      if (this.#tick_interval === null) {
        this.#tick_interval = setInterval(() => {
          this.objects.forEach((object) => object.impulse$.next(this));
          if (this.users.size === 0 && this.#tick_interval !== null) {
            clearInterval(this.#tick_interval);
            this.#tick_interval = null;
          }
        }, 50);
      }
    });

    this.leave$.subscribe((user) => {
      this.users.delete(user);
    });

    this.#move$.subscribe(({ target }) => {
      this.fields.check(target);
    });
  }

  get key() {
    return this.#key;
  }

  get id() {
    return 'SHARD';
  }

  /**
   * @readonly
   */
  get move$() {
    return this.#move$.asObservable();
  }

  /**
   * @param {import('../object/index.js').ServerObject} target
   * @param {{
   *  x?: number,
   *  y?: number,
   *  z?: number,
   *  direction?: string,
   *  instant?: boolean,
   *  cutscene?: boolean,
   *  speed?: number,
   * }} data
   * @return {import('../const/index.js').ServerMessage}
   */
  move(target, {
    x,
    y,
    z,
    direction: _direction,
    instant,
    cutscene,
    speed: _speed,
  }) {
    const lastXYZ = target.xyz;
    let diffX = 0;
    let diffY = 0;

    if (typeof x === 'number') {
      target.x = Math.round(x);
      diffX = target.x - lastXYZ.x;
    }

    if (typeof y === 'number') {
      target.y = Math.round(y);
      diffY = target.y - lastXYZ.y;
    }

    if (typeof z === 'number') {
      target.z = z;
    }

    const currentXYZ = target.xyz;

    const speed = _speed ?? 1;
    const now = performance.now();
    const distance = Math.hypot(diffX, diffY);
    const duration = instant ? 0 : (1000 * distance) / (target.getMovementSpeed() * speed);
    const endTime = now + duration;
    const extra = cutscene || duration === 0 ? { duration } : { endTime };

    const directionByDelta = getDirectionByDelta(lastXYZ, currentXYZ);
    const direction = _direction ?? (instant || !target.canDirectTo(directionByDelta) ? target.direction : directionByDelta);

    this.#move$.next({
      target,
      before: lastXYZ,
      after: currentXYZ,
    });

    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_MOVE,
      data: {
        target: target.id,
        ...currentXYZ,
        direction,
        ...extra,
        speed,
      },
    };
  }

  /**
   * @param {import('../const/index.js').ServerMessage[]} messages
   */
  sync(messages) {
    if (messages.length > 0 === false) {
      return;
    }
    this.users.forEach((user) => {
      user.send(messages);
    });
  }
}

/**
 * @typedef {Shard} ShardType
 */
