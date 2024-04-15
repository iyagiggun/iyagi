/**
 * @typedef {import('../object').IObject | import('../utils/coordinates').Position} Target
 */

class Camera {
  #scene;

  /** @type {import('../object').IObject | null} */
  target = null;

  /**
   * @param {import('./').IScene} scene
   */
  constructor(scene) {
    this.#scene = scene;
  }

  /**
   * @param {Target} target
   */
  point(target) {
    this.target = null;
    const app = this.#scene.application();
    if (!app) {
      throw new Error('[scene:camera] there is no iyagi.');
    }
    const { x, y } = 'center' in target ? target.center() : target;
    const { width, height } = app.view;
    this.#scene.container.x = Math.round(width / 2 - x);
    this.#scene.container.y = Math.round(height / 2 - y);
  }

  /**
   * @param {Target} target
   * @param {Object} [options]
   * @param {string} [options.type]
   * @param {number} [options.speed]
   */
  move(target, options) {
    this.target = null;
    const app = this.#scene.application();
    if (!app) {
      throw new Error('[scene:camera] there is no iyagi.');
    }
    const { container } = this.#scene;
    const { x, y } = 'center' in target ? target.center() : target;
    const { width: appWidth, height: appHeight } = app.view;
    const destX = Math.round((appWidth / 2) - x);
    const destY = Math.round((appHeight / 2) - y);

    // TODO :: ease, ...
    // eslint-disable-next-line no-unused-vars
    const type = options?.type ?? 'linear';
    const speed = (options?.speed ?? 1) * 3;

    const { ticker } = app;

    return /** @type {Promise<void>} */(new Promise((resolve) => {
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
          resolve();
        } else {
          const deltaX = speed * (diffX / distance);
          const deltaY = speed * (diffY / distance);
          container.x += Math.round(deltaX);
          container.y += Math.round(deltaY);
        }
      };
      ticker.add(tick);
    }));
  }
}

export { Camera };
