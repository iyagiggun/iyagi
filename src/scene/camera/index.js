/* eslint-disable no-param-reassign */
import IApplication from '../../application';

const MAX_CAMERA_MOVE_SPEED = 99999;

const ICamera = {
  /**
   * @param {import('pixi.js').Container} container
   * @returns
   */
  create: (container) => {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} [_speed]
     * @returns
     */
    const moveTo = (x, y, _speed = MAX_CAMERA_MOVE_SPEED) => new Promise((resolve) => {
      const app = IApplication.get();
      const { width: appWidth, height: appHeight } = app.view;
      const destX = Math.round((appWidth / 2) - x);
      const destY = Math.round((appHeight / 2) - y);
      const speed = _speed * 2;
      const { ticker } = app;
      const tick = () => {
        const curX = container.x;
        const curY = container.y;
        const diffX = destX - curX;
        const diffY = destY - curY;
        const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
        const arrived = distance < speed;
        if (arrived) {
          container.x = destX;
          container.y = destY;
          ticker.remove(tick);
          resolve(undefined);
        } else {
          const deltaX = speed * (diffX / distance);
          const deltaY = speed * (diffY / distance);
          container.x += Math.round(deltaX);
          container.y += Math.round(deltaY);
        }
      };
      ticker.add(tick);
    });

    return Object.freeze({
      moveTo,
    });
  },
};

export default ICamera;
