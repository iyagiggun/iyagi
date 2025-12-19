import { BASIC_SERVER_MESSAGE_TYPES } from '../const/index.js';

export const Debugger = {
  /**
   * @param {import("@iyagi/commons/coords").Area} target
   */
  highlight: (target) => {
    return {
      type: BASIC_SERVER_MESSAGE_TYPES.DEBUGGER_HIGHLIGHT,
      data: {
        area: target,
      },
    };
  },
};
