import { Graphics } from 'pixi.js';
import ColorUtils from './color';

let enable = false;

const colorizeMap = new WeakMap();

const Debuger = {
  /**
   * @param {boolean} _enable
   */
  enable: (_enable) => {
    enable = _enable;
  },
  /**
   *
   * @param {import("../../scene").ISceneCreated} scene
   * @param {import("../coordinates").Area} area
   * @param {Object} [options]
   * @param {string} [options.color]
   */
  showArea: (scene, area, options) => {
    if (!enable) {
      console.error('debugging is off ');
      return;
    }
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
  /**
   * @param {import('../../object').IObjectCreated} object
   * @param {Object} [options]
   * @param {Object} [options.key]
   * @param {string} [options.color]
   */
  colorize: (object, options) => {
    if (!enable) {
      console.error('debugging is off ');
      return;
    }
    const key = options?.key || object;

    const {
      w, h,
    } = object.getArea();

    if (!colorizeMap.has(key)) {
      const color = options?.color ?? ColorUtils.getColorful();
      colorizeMap.set(key, color);
    }

    const cover = new Graphics();
    cover.zIndex = Infinity;
    cover.beginFill(`${colorizeMap.get(key)}55`);
    cover.drawRect(0, 0, w, h);
    cover.endFill();

    object.container.addChild(cover);
  },
};

export default Debuger;
