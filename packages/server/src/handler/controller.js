import { getDirectionByDelta, isIn, resolveXY } from '@iyagi/commons/coords';
import { BUILT_IN_CLIENT_MESSAGE_TYPES } from '../../../commons/src/message.js';

/**
 * @param {import('../object/index.js').ServerObjectType} target
 */
const getInteractPosition = (target, threshold = 10) => {
  const area = target.area;
  const direction = target.direction;

  if ('radius' in area) {
    const { x, y, radius } = area;
    switch (direction) {
      case 'up':
        return { x, y: y - radius - threshold };
      case 'down':
        return { x, y: y + radius + threshold };
      case 'left':
        return { x: x - radius - threshold, y };
      case 'right':
        return { x: x + radius + threshold, y };
      default:
        throw new Error('Invalid direction.');
    }
  }

  if ('left' in area && 'right' in area && 'top' in area && 'bottom' in area) {
    switch (direction) {
      case 'up':
        return { x: (area.left + area.right) / 2, y: area.top - threshold };
      case 'down':
        return { x: (area.left + area.right) / 2, y: area.bottom + threshold };
      case 'left':
        return { x: area.left - threshold, y: (area.top + area.bottom) / 2 };
      case 'right':
        return { x: area.right + threshold, y: (area.top + area.bottom) / 2 };
      default:
        throw new Error('Invalid direction.');
    }
  }

  throw new Error('Unknown area type.');
};

export const ControllerHandler = {
  /**
   * @param {import('../user/index.js').UserType} user
   * @param {*} message
   */
  [BUILT_IN_CLIENT_MESSAGE_TYPES.CONTROLLER_MOVE]: (user, message) => {
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

    const start = target.xyz;
    const dest = target.calcNextPos({ xy: data.xy, duration: 50 });
    const z = data.z ?? target.xyz.z;

    const obstacles = objects
      .filter((o) => o !== target && o.xyz.z === z)
      .map((o) => o.area);

    target.direction = data.direction ?? getDirectionByDelta(start, dest);
    const next = resolveXY(area, obstacles, dest);

    const pressed = objects.filter((o) => {
      if (o.xyz.z !== target.xyz.z - 1) {
        return false;
      }
      if (isIn(start, o)) {
        return false;
      }
      return isIn(next, o);
    });

    pressed.forEach((o) => {
      o.pressed$.next(user);
    });

    shard.sync([
      target.move({ ...next, direction: target.direction }),
    ]);
  },
  /**
   * @param {import('../user/index.js').UserType} user
   * @param {*} message
   */
  [BUILT_IN_CLIENT_MESSAGE_TYPES.CONTROLLER_INTERACT]: (user, message) => {
    const objects = user.shard.objects;
    const data = message.data;
    const target = objects.find((o) => o.id === data.target);

    if (!target) {
      return;
    }

    const checkPos = getInteractPosition(target);

    const interectable = objects.find((object) => {
      return object !== target
        && object.xyz.z === target.xyz.z
        && object.interaction$.observed
        && isIn(checkPos, object);
    });

    if (!interectable) {
      return;
    }

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

    if (interectable.canDirectTo(interactDirection)) {
      // const rollbackDirection = nearest.direction;
      const before = interectable.move({
        direction: interactDirection,
      });
      // const after = StageDirector
      //   .move(nearest, {
      //     direction: rollbackDirection,
      //   });
      user.send([before]);
    }

    interectable.interaction$.next(user);
  },
  /**
   * @param {import('../user/index.js').UserType} user
   * @param {*} message
   */
  [BUILT_IN_CLIENT_MESSAGE_TYPES.CONTROLLER_ACTION]: (user, message) => {
    const objects = user.shard.objects;
    const data = message.data;
    const target = objects.find((o) => o.id === data.id);

    if (!target) {
      return;
    }

    target.action$.next({ user, input: data.input });
  },
};
