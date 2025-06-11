import { ServerObject } from '../../object/index.js';

export const CameraCommand = {
  /**
   * @param {ServerObject | import('../../../coords/index.js').XY} target
   * @param {Object} [options={}]
   * @param {1|2|3} [options.speed]
   * @returns {import('../../const/index.js').ServerMessage}
   */
  focus(target, options) {
    const xy = target instanceof ServerObject ? target.center() : target;
    return {
      type: 'camera.focus',
      data: {
        ...xy,
        ...options,
      },
    };
  },
};
