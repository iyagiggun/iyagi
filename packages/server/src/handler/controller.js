import { getDirectionByDelta, getOverlapRatio, resolveXY } from '@iyagi/commons/coords';
import { BUILT_IN_CLIENT_MESSAGE_TYPES } from '../../../commons/src/message.js';

export const CONTROLLER_HANDLER = {
  /**
   * @param {import('../user/index.js').UserType} user
   * @param {*} message
   */
  [BUILT_IN_CLIENT_MESSAGE_TYPES.CONTROLLER_MOVE]: (user, message) => {
    if (user.controllable === false) {
      return;
    }

    const data = message.data;

    const shard = user.shard;
    const target = user.avatar;

    const area = target.area;
    if (('radius' in area) === false) {
      throw new Error('controller.move only supports circle area.');
    }

    const start = target.xyz;
    const dest = target.calcNextPos({ xy: data.xy, duration: 50 });
    const z = data.z ?? target.xyz.z;

    const obstacles = shard.objects
      .filter((o) => o !== target && o.xyz.z === z)
      .map((o) => o.area);

    target.direction = data.direction ?? getDirectionByDelta(start, dest);
    const next = resolveXY(area, obstacles, dest);

    shard.sync([
      shard.move(target, { ...next, direction: target.direction }),
    ]);
  },
  /**
   * @param {import('../user/index.js').UserType} user
   * @param {*} message
   */
  [BUILT_IN_CLIENT_MESSAGE_TYPES.CONTROLLER_INTERACT]: (user, message) => {
    if (user.controllable === false) {
      return;
    }

    const objects = user.shard.objects;
    const data = message.data;
    const target = objects.find((o) => o.id === data.target);

    if (!target) {
      return;
    }

    const interactArea = {
      ...target.getFrontXY(),
      z: target.z,
      radius: 10,
    };

    const interactables = objects.filter((object) => {
      return object !== target
        && object.interaction$.observed
        && object.xyz.z === target.xyz.z
        && getOverlapRatio(interactArea, object.area);
    });

    if (interactables.length > 0 === false) {
      return;
    }

    const interactable = interactables.reduce((closest, current) => {
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

    if (interactable.canDirectTo(interactDirection)) {
      const before = user.shard.move(interactable, {
        direction: interactDirection,
      });
      user.send([before]);
    }

    interactable.interaction$.next({ user });
  },
  /**
   * @param {import('../user/index.js').UserType} user
   * @param {*} message
   */
  [BUILT_IN_CLIENT_MESSAGE_TYPES.CONTROLLER_ACTION]: (user, message) => {
    if (user.controllable === false) {
      return;
    }

    const objects = user.shard.objects;
    const data = message.data;
    const target = objects.find((o) => o.id === data.id);

    if (!target) {
      return;
    }

    target.action$.next({ user, input: data.input });
  },
};

