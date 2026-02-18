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

