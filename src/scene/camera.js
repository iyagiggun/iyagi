const MAX_CAMERA_MOVE_SPEED = 99999;

const camera = {
  /**
   * @param {import('./../object/').IObject} target
   * @param {number} [_speed]
   */
  focus: (target, _speed = MAX_CAMERA_MOVE_SPEED) => new Promise((resolve) => {
    const container = target.scene?.container;
    const app = target.scene?.iyagi?.application;
    if (!container || !app) {
      return;
    }

    const { x, y } = target.center();

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
        // @ts-ignore
        resolve();
      } else {
        const deltaX = speed * (diffX / distance);
        const deltaY = speed * (diffY / distance);
        container.x += Math.round(deltaX);
        container.y += Math.round(deltaY);
      }
    };
    ticker.add(tick);
  }),
};

export { camera };
