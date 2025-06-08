import { Subject } from 'rxjs';
import { IMT } from '../../const/message.js';
import { ShardMessage } from './message/index.js';
import { getDirectionByDelta, getNextXYZ, isIn, isOverlap } from '../../coords/index.js';

export class Shard {
  #key;

  /**
   * @param {Object} p
   * @param {string} p.key
   * @param {import('../object/iobject.js').IObject[]} p.objects
   */
  constructor({
    key,
    objects,
  }) {
    this.#key = key;
    this.objects = objects;
    this.message = new ShardMessage(this);
    /**
     * @type {Subject<import('../../teller/index.js').SubjectData>}
     */
    this.load$ = new Subject();
    /**
     * @type {Subject<import('../../teller/index.js').SubjectData>}
     */
    this.loaded$ = new Subject();

    /**
     * @type {Subject<import('../../teller/index.js').SubjectData>}
     * @description Operates based on delta values
     */
    this.move$ = new Subject();

    /**
     * @type {Subject<import('../../teller/index.js').SubjectData>}
     */
    this.interact$ = new Subject();

    this.load$.subscribe(({ user, reply }) => {
      reply({
        type: IMT.SHARD_LOAD,
        data: {
          shard: {
            objects: user.shard.objects.map((o) => o.toLoadData()),
          },
        },
      });
    });

    // delta 로 동작함 (position 이 아니라)
    this.move$.subscribe(({ user, reply, message }) => {
      const objects = user.shard.objects;
      const data = message.data;
      const target = user.shard.objects.find((o) => o.id === data.id);
      if (!target) {
        throw new Error(`Fail to move. No target (${message.data.id}).`);
      }
      const delta = data.delta;
      const x = target.x + (delta.x ?? 0);
      const y = target.y + (delta.y ?? 0);
      const z = target.z + (delta.z ?? 0);
      const next = getNextXYZ({ target, objects, destination: { x, y, z } });
      target.direction = data.direction || getDirectionByDelta(target, next);
      target.x = next.x;
      target.y = next.y;
      target.z = next.z;

      const tc = target.center();
      const pressed = objects.filter((o) => {
        if (o.hitbox.z !== target.z - 1) {
          return false;
        }
        if (!isIn(tc, o.hitbox)) {
          return false;
        }
        return true;
      });

      reply({
        type: IMT.OBJECT_MOVE,
        data: {
          target: target.id,
          ...target.getClientXYZ(),
          direction: target.direction,
          speed: data.speed,
        },
      });

      pressed.forEach((o) => {
        o.pressed$.next({ user, message, reply });
      });
    });

    this.interact$.subscribe(({ user, reply, message }) => {
      const objects = user.shard.objects;
      const data = message.data;
      const target = objects.find((o) => o.id === data.target);

      if (!target) {
        return;
      }

      const interactionArea = (() => {
        const hitbox = target.hitbox ?? { ...target, w: 0, h: 0 };
        const {
          x, y, w, h,
        } = hitbox;
        switch (target.direction) {
          case 'up':
            return {
              x, y: y - 5, w, h: h + 5,
            };
          case 'down':
            return {
              x, y, w, h: h + 5,
            };
          case 'left':
            return {
              x: x - 5, y, w: w + 5, h,
            };
          case 'right':
            return {
              x, y, w: w + 5, h,
            };
          default:
            throw new Error('Invalid direction.');
        }
      })();

      // TODO :: issue - leftest was choosed..
      const willInteract = objects.find(
        (object) => {
          return object !== target
              && object.z === target.z
              && isOverlap(object.hitbox, interactionArea);
        }
      );
      willInteract?.interact$.next({ user, message, reply });

    });
  }

  get key() {
    return this.#key;
  }

  get id() {
    return 'SHARD';
  }
}

/**
 * @typedef {Shard} ShardType
 */
