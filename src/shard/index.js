import { Subject } from 'rxjs';
import { IMT } from '../const/message.js';
import { ShardMessage } from './message/index.js';
import { getDirectionByDelta, getNextXYZ, isOverlap } from '../coords/index.js';

export class Shard {
  /**
   * @param {Object} p
   * @param {import('../object/iobject.js').IObject[]} p.objects
   */
  constructor({
    objects,
  }) {
    this.objects = objects;
    this.message = new ShardMessage(this);
    /**
     * @type {Subject<import('../teller/index.js').SubjectData>}
     */
    this.load$ = new Subject();
    /**
     * @type {Subject<import('../teller/index.js').SubjectData>}
     */
    this.loaded$ = new Subject();

    /**
     * @type {Subject<import('../teller/index.js').SubjectData>}
     */
    this.move$ = new Subject();

    /**
     * @type {Subject<import('../teller/index.js').SubjectData>}
     */
    this.interact$ = new Subject();

    this.load$.subscribe(({ shard, listen }) => {
      listen({
        type: IMT.SHARD_LOAD,
        data: {
          shard: {
            objects: shard.objects.map((o) => o.toLoadData()),
          },
        },
      });
    });

    // delta 로 동작함 (position 이 아니라)
    this.move$.subscribe(({ shard, listen, message }) => {
      const objects = shard.objects;
      const data = message.data;
      const target = shard.objects.find((o) => o.serial === data.serial);
      if (!target) {
        throw new Error(`Fail to move. No target (${message.data.serial}).`);
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

      const tHitbox = target.hitbox;
      if (tHitbox) {
        const overlaped = objects.filter((o) => {
          if (o.serial === target.serial) {
            return false;
          }
          const oHitbox = o.hitbox;
          if (oHitbox) {
            return isOverlap({ ...oHitbox }, { ...next, w: tHitbox.w, h: tHitbox.h });
          }
          return false;
        });
        console.error(overlaped);
      }

      listen({
        type: IMT.OBJECT_MOVE,
        data: {
          target: target.serial,
          x: target.clientX,
          y: target.clientY,
          z: target.z,
          direction: target.direction,
          speed: data.speed,
        },
      });
    });

    this.interact$.subscribe(({ user, shard, listen, message }) => {
      const objects = shard.objects;
      const data = message.data;
      const target = objects.find((o) => o.serial === data.target);

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
          return object !== target && object.hitbox && isOverlap(object.hitbox, interactionArea);
        }
      );
      willInteract?.interact$.next({ user, shard, message, listen });

    });
  }
}

/**
 * @typedef {Shard} ShardType
 */
