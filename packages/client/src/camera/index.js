import global from '../global/index.js';
import { FRAMES_PER_SECOND } from '../const/index.js';
import { shard } from '../shard/index.js';
import { client_object_manager } from '../object/manager.js';

/** @type {import('../object/index.js').default | null} */
let target = null;

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
 * @param {import('@iyagi/commons/coords').XY & { speed?: 1 | 2 | 3 }} info
 */
const move = (info) => {
  const container = shard.container;
  const { x: destX, y: destY } = getContainerPos(info);
  if (!info.speed) {
    container.x = destX;
    container.y = destY;
    return Promise.resolve();
  }
  const speed = info.speed * 300 / FRAMES_PER_SECOND;
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
 * @param {import('@iyagi/commons/coords').XY} xy
 */
const point = (xy) => {
  const { x, y } = getContainerPos(xy);
  shard.container.x = x;
  shard.container.y = y;
  return Promise.resolve();
};

/**
 * @param {import('@iyagi/server/const').ServerMessage['data']} data
 */
const follow = (data) => {
  target = client_object_manager.find(data.target);
  return point(target.xyz);
};

export default {
  get target() {
    return target;
  },
  set target(value) {
    target = value;
  },
  move,
  follow,
  point,
};
