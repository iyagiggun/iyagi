import { BASIC_SERVER_MESSAGE_TYPES } from '../const/index.js';

export const Supervisor = {
  /**
   * @param {import("../../commons/coords.js").Area} target
   * @param {*} [options]
   */
  highlight: (target, options) => {
    return {
      type: BASIC_SERVER_MESSAGE_TYPES.SUPERVISOR_HIGHLIGHT,
      data: {
        area: target,
      },
    };
  },
};
