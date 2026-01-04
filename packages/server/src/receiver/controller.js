import { getDirectionByDelta, isIn, isOverlap } from '@iyagi/commons';
import { StageDirector } from '../director/stage.js';
import { ShardForge } from '../shard/forge.js';

export const ControllerReceiver = {
  /**
   * @param {import('../user/index.js').UserType} user
   * @param {*} message
   */
  move: (user, message) => {
    const shard = ShardForge.seek(user.shard);
    const objects = shard.objects;
    const data = message.data;
    const target = shard.objects.find((o) => o.id === data.id);
    if (!target) {
      throw new Error(`Fail to move. No target (${message.data.id}).`);
    }
    const beforeCenter = target.center();

    const delta = data.delta;
    const x = target.x + (delta.x ?? 0);
    const y = target.y + (delta.y ?? 0);
    const z = target.z + (delta.z ?? 0);
    const next = target.getNextXYZ({ objects, destination : { x, y, z } });
    target.direction = data.direction || getDirectionByDelta(target, next);
    target.x = next.x;
    target.y = next.y;
    target.z = next.z;

    const afterCenter = target.center();
    const pressed = objects.filter((o) => {
      if (o.hitbox.z !== target.z - 1) {
        return false;
      }
      if (!isIn(afterCenter, o.hitbox)) {
        return false;
      }
      return !isIn(beforeCenter, o.hitbox);
    });

    user.send([
      StageDirector.move(target, {
        ...target.xyz,
        direction: target.direction,
        speed: data.speed,
      }),
    ]);

    pressed.forEach((o) => {
      o.pressed$.next(user);
    });
  },
  /**
   * @param {import('../user/index.js').UserType} user
   * @param {*} message
   */
  interact: (user, message) => {
    const shard = ShardForge.seek(user.shard);
    const objects = shard.objects;
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

    const interactables = objects.filter((object) => {
      return object !== target
        && object.z === target.z
        && isOverlap(object.hitbox, interactionArea);
    });

    if (interactables.length === 0) {
      return;
    }

    const interactionAreaCenter = {
      x: interactionArea.x + interactionArea.w / 2,
      y: interactionArea.y + interactionArea.h / 2,
    };

    const nearest = interactables.reduce((most, current) => {
      const mostDistance = Math.hypot(
        most.center().x - interactionAreaCenter.x,
        most.center().y - interactionAreaCenter.y
      );
      const currentDistance = Math.hypot(
        current.center().x - interactionAreaCenter.x,
        current.center().y - interactionAreaCenter.y
      );
      return currentDistance < mostDistance ? current : most;
    });

    const interactDirection = (() => {
      switch (target.direction) {
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

    nearest.interaction$.next({
      user,
      shard,
      reply: (arr) => {
        if (nearest.canDirectTo(interactDirection)) {
          const rollbackDirection = nearest.direction;
          const before = StageDirector
            .move(nearest, {
              direction: interactDirection,
            });
          const after = StageDirector
            .move(nearest, {
              direction: rollbackDirection,
            });

          user.send([before, ...arr, after]);

        } else {
          user.send(arr);
        }
      },
    });
  },
  /**
   * @param {import('../user/index.js').UserType} user
   * @param {*} message
   */
  action: (user, message) => {
    const shard = ShardForge.seek(user.shard);
    const objects = shard.objects;
    const data = message.data;
    const target = objects.find((o) => o.id === data.id);

    if (!target) {
      return;
    }

    target.action$.next({ user, input: data.input });
  },
};
