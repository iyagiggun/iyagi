import global from '../global/index.js';

export const fade = {
  /**
   * @param {import('pixi.js').Container} container
   * @returns {Promise<void>}
   */
  in(container) {
    const ticker = global.app.ticker;
    const delta = 0.05;

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
   * @param {import('pixi.js').Container} container
   * @returns {Promise<void>}
   */
  out(container) {
    const ticker = global.app.ticker;
    const delta = 0.05;

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
};
