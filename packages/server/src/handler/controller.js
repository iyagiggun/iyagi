import { getDirectionByDelta, resolveXY } from '@iyagi/commons/coords';
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
  [BUILT_IN_CLIENT_MESSAGE_TYPES.CONTROLLER_ACTION]: (user, message) => {
    if (user.controllable === false) {
      return;
    }

    const data = message.data;
    const target = user.avatar;

    target.action$.next({ user, input: data.input });
  },
};

