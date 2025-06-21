import { getDirectionByDelta, getNextXYZ, isIn, isOverlap } from '../../coords/index.js';
import { ServerCommand } from '../shard/command/index.js';

export const ControllerReceiver = {
  /**
   * @param {import("../const/index.js").ServerPayload} payload
   * @param {*} message
   */
  move: ({ user, reply }, message) => {
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

    reply(
      new ServerCommand()
        .move(target, {
          ...target.xyz,
          direction: target.direction,
          speed: data.speed,
        })
        .build()
    );

    pressed.forEach((o) => {
      o.pressed$.next({ user, reply });
    });
  },
  /**
   * @param {import("../const/index.js").ServerPayload} payload
   * @param {*} message
   */
  interact: ({ user, reply }, message) => {
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
    willInteract?.interact$.next({ user, reply });
  },
};
