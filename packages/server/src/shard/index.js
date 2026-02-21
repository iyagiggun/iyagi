import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { getDirectionByDelta, getOverlapRatio } from '@iyagi/commons/coords';
import { Subject } from 'rxjs';
import { Fields } from '../field/fields.js';
import { ShardUsers } from './users.js';
/**
 * @typedef {{
 *  target: import('../object/index.js').ServerObject,
 *  before: import('@iyagi/commons/coords').XYZ,
 *  after: import('@iyagi/commons/coords').XYZ,
 * }} MovePayload
 */

export class Shard {

  #key;

  /** @type {NodeJS.Timeout | null} */
  #tick_interval = null;

  users = new ShardUsers();

  /** @type {Subject<{ user: import('../user/index.js').UserType }>} */
  #join$ = new Subject();
  join$ = this.#join$.asObservable();

  /** @type {Subject<{ user: import('../user/index.js').UserType }>} */
  #leave$ = new Subject();
  leave$ = this.#leave$.asObservable();

  /** @type {Subject<MovePayload>} */
  #move$ = new Subject();
  move$ = this.#move$.asObservable();

  /** @type {Subject<{ user: import('../user/index.js').UserType, target: import('../object/index.js').ServerObjectType }>} */
  #interaction$ = new Subject();
  interaction$ = this.#interaction$.asObservable();

  /**
   * @param {Object} p
   * @param {string} p.key
   * @param {import('../object/index.js').ServerObject[]} p.objects
   * @param {import('../field/index.js').Field[]} [p.fields]
   */
  constructor({
    key,
    objects,
    fields,
  }) {
    this.#key = key;
    this.objects = objects;
    this.fields = new Fields(objects);
    this.fields.add(fields ?? []);

    /**
     * @type {Subject<import('../user/index.js').UserType>}
     */
    this.loaded$ = new Subject();

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
   * @param {import('../user/index.js').UserType} user
   */
  interact(user) {
    const avatar = user.avatar;
    const shard = user.shard;

    const interactArea = {
      ...avatar.getFrontXY(),
      z: avatar.z,
      radius: 10,
    };

    const interactables = shard.objects.filter((object) => {
      return object !== avatar
        && object.interactable
        && object.xyz.z === avatar.xyz.z
        && getOverlapRatio(interactArea, object.area);
    });

    if (interactables.length > 0 === false) {
      return;
    }

    const target = interactables.reduce((closest, current) => {
      const closestDist = Math.hypot(
        closest.xyz.x - interactArea.x,
        closest.xyz.y - interactArea.y
      );
      const currentDist = Math.hypot(
        current.xyz.x - interactArea.x,
        current.xyz.y - interactArea.y
      );
      return currentDist < closestDist ? current : closest;
    });

    const interactDirection = (() => {
      switch (avatar.direction) {
        case 'up':
          return 'down';
        case 'down':
          return 'up';
        case 'left':
          return 'right';
        case 'right':
          return 'left';
        default:
          throw new Error('Invalid direction.');
      }
    })();

    if (target.canDirectTo(interactDirection)) {
      const before = shard.move(target, {
        direction: interactDirection,
      });
      user.send([before]);
    }

    this.#interaction$.next({ user, target });
  }

  /**
   * @param {import('../user/index.js').UserType} user
   * @return {import('../const/index.js').ServerMessage}
   */
  leave(user) {
    this.users.delete(user);
    this.#leave$.next({ user });

    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.SHARD_LEAVE,
      data: {
        user: user.key,
      },
    };
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
    this.users.list().forEach((user) => {
      user.send(messages);
    });
  }
}

export * from './forge.js';

/**
 * @typedef {Shard} ShardType
 */
