import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { ServerObject } from '../object/index.js';

export const CameraDirector = {
  /**
   * @param {ServerObject | import('@iyagi/commons').XY} target
   * @param {Object} [options={}]
   * @param {1|2|3} [options.speed]
   *
   * @return {import('../const/index.js').ServerMessage}
   */
  focus(target, options) {
    const xy = target instanceof ServerObject ? target.center() : target;
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.CAMERA_FOCUS,
      data: {
        ...xy,
        ...options,
      },
    };
  },
};
