import { BASIC_SERVER_MESSAGE_TYPES } from '../const/index.js';
import { ServerObject } from '../object/index.js';

export const CameraDirector = {
  /**
   * @param {ServerObject | import('../../coords/index.js').XY} target
   * @param {Object} [options={}]
   * @param {1|2|3} [options.speed]
   *
   * @return {import('../const/index.js').ServerMessage}
   */
  focus(target, options) {
    const xy = target instanceof ServerObject ? target.center() : target;
    return {
      type: BASIC_SERVER_MESSAGE_TYPES.CAMERA_FOCUS,
      data: {
        ...xy,
        ...options,
      },
    };
  },
};
