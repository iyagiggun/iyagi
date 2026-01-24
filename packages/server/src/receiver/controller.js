import { getDirectionByAngle, isOverlap, resolveXY } from '@iyagi/commons/coords';
import { StageDirector } from '../director/stage.js';

export const ControllerReceiver = {
  /**
   * @param {import('../user/index.js').UserType} user
   * @param {*} message
   */
  move: (user, message) => {
    const shard = user.shard;
    const objects = shard.objects;
    const data = message.data;
    const target = shard.objects.find((o) => o.id === data.id);
    if (!target) {
      throw new Error(`Fail to move. No target (${message.data.id}).`);
    }
    const area = target.area;
    if (('radius' in area) === false) {
      throw new Error('controller.move only supports circle area.');
    }

    const lastXYZ = target.xyz;

    const x = Math.round(lastXYZ.x + Math.cos(data.angle) * 5);
    const y = Math.round(lastXYZ.y + Math.sin(data.angle) * 5);
    const z = data.z ?? lastXYZ.z;

    const obstacles = objects
      .filter((o) => o !== target && o.xyz.z === z)
      .map((o) => o.area);

    const next = resolveXY(area, obstacles, { x, y });

    target.direction = data.direction || getDirectionByAngle(data.angle);

    // TODO:: press 처리
    // const after = target.xy;
    // const pressed = objects.filter((o) => {
    //   if (o.hitbox.z !== target.z - 1) {
    //     return false;
    //   }
    //   if (!isIn(after, o.hitbox)) {
    //     return false;
    //   }
    //   return !isIn(before, o.hitbox);
    // });

    shard.sync([
      target.move({ ...next, direction: target.direction }),
    ]);

    // pressed.forEach((o) => {
    //   o.pressed$.next(user);
    // });
  },
  /**
   * @param {import('../user/index.js').UserType} user
   * @param {*} message
   */
  interact: (user, message) => {
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

    const interactables = objects.filter((object) => {
      return object !== target
        && object.xyz.z === target.xyz.z
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

    if (nearest.canDirectTo(interactDirection)) {
      // const rollbackDirection = nearest.direction;
      const before = StageDirector
        .move(nearest, {
          direction: interactDirection,
        });
      // const after = StageDirector
      //   .move(nearest, {
      //     direction: rollbackDirection,
      //   });
      user.send([before]);
    }

    nearest.interaction$.next(user);
  },
  /**
   * @param {import('../user/index.js').UserType} user
   * @param {*} message
   */
  action: (user, message) => {
    const objects = user.shard.objects;
    const data = message.data;
    const target = objects.find((o) => o.id === data.id);

    if (!target) {
      return;
    }

    target.action$.next({ user, input: data.input });
  },
};
