import { FRAMES_PER_SECOND } from '../const/index.js';
import global from '../global/index.js';

/**
 * @param {import('@iyagi/commons/coords').XY} xy
 */
const getContainerPos = ({ x, y }) => {
  const { width, height } = global.app.screen;
  return {
    x: Math.round(width / 2 - x),
    y: Math.round(height / 2 - y),
  };
};

/**
 * @param {import('pixi.js').Container} container
 */
export const camera = (container) => {

  /** @type {function | null} */
  let release = null;

  /**
   * @param {import('@iyagi/commons/coords').XY & { speed?: number }} p
   * @returns {Promise<void>}
   */
  const move = ({ x, y, speed: _speed }) => {
    release?.();

    const { x: destX, y: destY } = getContainerPos({ x, y });
    if (!_speed) {
      container.x = destX;
      container.y = destY;
      return Promise.resolve();
    }
    const speed = _speed * 300 / FRAMES_PER_SECOND;
    const ticker = global.app.ticker;

    return new Promise((resolve, reject) => {
      const tick = () => {
        const curX = container.x;
        const curY = container.y;
        const diffX = destX - curX;
        const diffY = destY - curY;
        const distance = Math.hypot(diffX, diffY);
        const arrived = distance < speed;
        if (arrived) {
          container.x = destX;
          container.y = destY;
          ticker.remove(tick);
          resolve();
        } else {
          const deltaX = Math.round(speed * (diffX / distance));
          const deltaY = Math.round(speed * (diffY / distance));
          container.x += deltaX;
          container.y += deltaY;
          if (Number.isNaN(deltaX) || Number.isNaN(deltaY)) {
            ticker.remove(tick);
            reject(new Error('delta is NaN'));
          }
        }
      };
      ticker.add(tick);
    });
  };

  /**
   * @param {import('../object/index.js').ClientObjectType} target
   */
  const follow = async (target) => {
    release?.();
    await move(target.xyz);
    const subs = target.move$.subscribe((xy) => {
      const { x, y } = getContainerPos(xy);
      container.x = x;
      container.y = y;
    });
    release = () => subs.unsubscribe();
  };

  return {
    move,
    follow,
  };
};
