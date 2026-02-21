import { BUILT_IN_CLIENT_MESSAGE_TYPES } from '@iyagi/commons';
import { getOverlapRatio } from '@iyagi/commons/coords';

export const SHARD_HANDLER = {
  /**
   * @param {import('../user/index.js').UserType} user
   */
  [BUILT_IN_CLIENT_MESSAGE_TYPES.SHARD_INTERACT]: (user) => {
    if (user.controllable === false) {
      return;
    }

    const target = user.avatar;
    const shard = user.shard;

    const interactArea = {
      ...target.getFrontXY(),
      z: target.z,
      radius: 10,
    };

    const interactables = shard.objects.filter((object) => {
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
      const before = shard.move(interactable, {
        direction: interactDirection,
      });
      user.send([before]);
    }

    interactable.interaction$.next({ user });
  },
};
