import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { ServerObject } from '../object/index.js';

export const CameraDirector = {
  /**
   * @param {import('../object/index.js').ServerObjectType | import('@iyagi/commons/coords').XY} target
   * @param {Object} [options={}]
   * @param {1|2|3} [options.speed]
   *
   * @return {import('../const/index.js').ServerMessage}
   */
  focus(target, options) {
    const xy = target instanceof ServerObject ? target.xy() : target;
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.CAMERA_FOCUS,
      data: {
        ...xy,
        ...options,
      },
    };
  },
};
