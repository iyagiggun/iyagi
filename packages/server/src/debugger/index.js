import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';

export const Debugger = {
  /**
   * @param {import('@iyagi/commons').Area} area
   */
  highlight: (area) => {
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.DEBUGGER_HIGHLIGHT,
      data: {
        area,
      },
    };
  },
};
