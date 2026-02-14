import global from '../global/index.js';

/**
 * @param {import('pixi.js').Container} container
 * @param {Object} [options]
 * @param {number} [options.duration]
 * @returns {Promise<void>}
 */
export const shake = (container, {
  duration,
} = {}) => {

  const ticker = global.app.ticker;
  const beforeX = container.x;
  let idx = 0;

  return new Promise((resolve) => {
    const process = () => {
      container.x = beforeX + (idx % 2 === 0 ? 1 : -1);
      idx++;
    };
    ticker.add(process);
    setTimeout(() => {
      ticker.remove(process);
      container.x = beforeX;
      resolve();
    }, duration || 100);
  });
};

/**
 * @param {import('pixi.js').Container} container
 * @returns {Promise<void>}
 */
export const fadeIn = (container) => {
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
};

/**
 * @param {import('pixi.js').Container} container
 * @returns {Promise<void>}
 */
export const fadeOut = (container) => {
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
};

