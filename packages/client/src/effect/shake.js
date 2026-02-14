import global from '../global/index.js';

/**
 * @typedef {Object} ShakeInfo
 * @property {number} timeout
 * @property {Function} complete
 */

/**
 * @type {WeakMap<import('pixi.js').Container, ShakeInfo>}
 */
const shakings = new WeakMap();

/**
 * @param {import('pixi.js').Container} container
 * @param {Object} [options]
 * @param {number} [options.duration]
 */
export const shake = (container, {
  duration,
} = {}) => {

  const ing = shakings.get(container);
  if (ing) {
    clearTimeout(ing.timeout);
    ing.complete();
  }

  const ticker = global.app.ticker;
  const beforeX = container.x;
  let idx = 0;

  const process = () => {
    container.x = beforeX + (idx % 2 === 0 ? 1 : -1);
    idx++;
  };

  const complete = () => {
    container.x = beforeX;
  };

  const timeout = setTimeout(() => {
    ticker.remove(process);
    complete();
    shakings.delete(container);
  }, duration || 100);

  shakings.set(container, { timeout, complete });
  ticker.add(process);
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

