import { IMT } from '../const/message.js';

export const message = {
  /**
   * @param {number} delay ms
   */
  wait(delay) {
    return {
      type: IMT.WAIT,
      data: {
        delay,
      },
    };
  },
  /**
   * @param {*[]} list
   */
  list(list) {
    return {
      type: IMT.LIST,
      data: {
        list,
      },
    };
  },
  /**
   * @param {import('../coords/index.js').XY & { speed: 0 | 1 | 2 | 3}} data - data.speed = 0 <- instantly
   */
  focus(data) {
    return {
      type: IMT.SCENE_FOCUS,
      data,
    };
  },
};
