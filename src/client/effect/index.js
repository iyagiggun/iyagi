import { BASIC_SERVER_MESSAGE_TYPES } from '../../server/const/index.js';
import global from '../global/index.js';
import { shard } from '../shard/index.js';

/**
 * @param {Object} target
 * @param {string} target.type
 * @param {string} target.id
 */
const toContainer = (target) => {
  switch (target.type) {
    case 'SHARD':
      return shard.container;
    // case 'OBJECT':
    //   return;
    default:
      throw new Error(`Unknown target type: ${target.type}`);
  }
};

export const CLIENT_EFFECT_MESSAGE_HANDLER = {
  /**
   * @param {import('../../server/const/index.js').ServerMessage} param0
   */
  [BASIC_SERVER_MESSAGE_TYPES.EFFECT_FADE_IN]: ({ data }) => {
    const ticker = global.app.ticker;
    const delta = 0.05;
    const container = toContainer(data.target);

    return new Promise((resolve) => {
      const process = () => {
        if (container.alpha >= 1) {
          container.alpha = 1;
          ticker.remove(process);
          resolve();
        }
        container.alpha += delta;
      };
      ticker.add(process);
    });
  },
  /**
   * @param {import('../../server/const/index.js').ServerMessage} param0
   */
  [BASIC_SERVER_MESSAGE_TYPES.EFFECT_FADE_OUT]: ({ data }) => {
    const ticker = global.app.ticker;
    const delta = 0.05;
    const container = toContainer(data.target);
    return new Promise((resolve) => {
      const process = () => {
        if (container.alpha <= 0) {
          container.alpha = 0;
          ticker.remove(process);
          resolve();
        }
        container.alpha -= delta;
      };
      ticker.add(process);
    });
  },
  /**
   * @param {import('../../server/const/index.js').ServerMessage} param0
   */
  [BASIC_SERVER_MESSAGE_TYPES.EFFECT_SHAKE]: ({ data }) => {
    const ticker = global.app.ticker;
    const container = toContainer(data.target);

    console.error(data);
    console.error(container);

    return new Promise((resolve) => {
      const process = () => {
        container.x += (Math.random() - 0.5) * 10;
        container.y += (Math.random() - 0.5) * 10;
      };
      ticker.add(process);
      setTimeout(() => {
        ticker.remove(process);
        resolve();
      }, data.duration || 1000);
    });
  },
};
