import global from '../global/index.js';
import { shard } from '../shard/index.js';

/**
 * @param {string} id
 */
const toContainer = (id) => {
  switch (id) {
    case 'SHARD':
      return shard.container;
    default:
      throw new Error('invalid id :' + id);
  }
};

const effect = {
  /**
   * @param {*} data
   */
  fadeIn: (data) => {
    const ticker = global.app.ticker;
    const delta = 0.05;

    const promises = data.target.map((id) => new Promise((resolve) => {
      const container = toContainer(id);
      const process = () => {
        if (container.alpha >= 1) {
          container.alpha = 1;
          ticker.remove(process);
          resolve();
        }
        container.alpha += delta;
      };
      ticker.add(process);
    }));
    return Promise.all(promises);
  },

  fadeOut: (data) => {
    const ticker = global.app.ticker;
    const delta = 0.05;

    const promises = data.target.map((id) => new Promise((resolve) => {
      const container = toContainer(id);
      const process = () => {
        if (container.alpha <= 0) {
          container.alpha = 0;
          ticker.remove(process);
          resolve();
        }
        container.alpha -= delta;
      };
      ticker.add(process);
    }));
    return Promise.all(promises);
  },

};

export { effect };
