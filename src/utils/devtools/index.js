import { Graphics } from 'pixi.js';
import ColorUtils from './color';

const colorizeMap = new WeakMap();

const devtools = {
  enable: false,
  /**
   * @param {import('../../scene').IScene} scene
   * @param {import("../coordinates").Area} area
   * @param {Object} [options]
   * @param {string} [options.color]
   */
  highlight: (scene, area, options) => {
    if (!devtools.enable) {
      return;
    }
    const graphics = new Graphics();
    graphics.x = area.x;
    graphics.y = area.y;
    graphics.width = area.w;
    graphics.height = area.h;

    graphics.rect(0, 0, area.w, area.h);
    graphics.fill(options?.color || '#ff0000');
    graphics.zIndex = Infinity;

    scene.container.addChild(graphics);
    window.setTimeout(() => {
      scene.container.removeChild(graphics);
    }, 3000);
  },
  /**
   * @param {import('../../object').IObject} object
   * @param {Object} [options]
   * @param {Object} [options.key]
   * @param {string} [options.color]
   */
  colorize: (object, options) => {
    if (!devtools.enable) {
      return;
    }
    const key = options?.key || object;

    const {
      w, h,
    } = object.area();

    if (!colorizeMap.has(key)) {
      const color = options?.color ?? ColorUtils.getColorful();
      colorizeMap.set(key, color);
    }

    const cover = new Graphics();
    cover.zIndex = Infinity;
    cover.rect(0, 0, w, h);
    cover.fill(`${colorizeMap.get(key)}55`);

    object.container.addChild(cover);
  },
};

export { devtools };
