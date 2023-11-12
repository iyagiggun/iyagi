import { Graphics } from 'pixi.js';

let enable = false;

const checkEnable = () => {
  if (!enable) {
    throw new Error('Debugger is not enabled.');
  }
};

const Debuger = {
  /**
   * @param {boolean} _enable
   */
  enable: (_enable) => {
    enable = _enable;
  },
  /**
   *
   * @param {import("../../scene/type").ISceneCreated} scene
   * @param {import("../coordinates/type").Area} area
   * @param {Object} [options]
   * @param {string} [options.color]
   */
  showArea: (scene, area, options) => {
    checkEnable();
    const graphics = new Graphics();
    graphics.x = area.x;
    graphics.y = area.y;
    graphics.width = area.w;
    graphics.height = area.h;

    graphics.beginFill(options?.color || '#ff0000');
    graphics.drawRect(0, 0, area.w, area.h);
    graphics.endFill();
    graphics.zIndex = Infinity;

    scene.container.addChild(graphics);
    window.setTimeout(() => {
      scene.container.removeChild(graphics);
    }, 3000);
  },
};

export default Debuger;
