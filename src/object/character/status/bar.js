import { Graphics } from 'pixi.js';
import IApplication from '../../../application';

const weakMap = new WeakMap();

const getGraphics = (container, key) => {
  /**
   * @type {Object<string, Graphics>}
   */
  let keyMap = weakMap.get(container);
  if (!keyMap) {
    keyMap = {};
    weakMap.set(container, keyMap);
  }
  let graphics = keyMap[key];
  if (!graphics) {
    graphics = new Graphics();
    keyMap[key] = graphics;
  }
  return graphics;
};

const IStatusBarBasic = {
  /**
   * @param {import('pixi.js').Container} container
   * @param {Object} status
   * @param {string} status.key
   * @param {number} status.before
   * @param {number} status.after
   * @param {number} status.max
   */
  show: (container, {
    key, before, after, max, color,
  }) => {
    const maxWidth = container.width;
    const diff = after - before;

    console.error(color);

    const graphics = getGraphics(container, key);
    graphics.clear();
    graphics.x = 0;
    graphics.lineStyle(2, 0xDE3249, 1);
    graphics.lineTo(maxWidth * (after / max), 0);

    const diffGraphics = new Graphics();

    if (diff > 0) {
      alert('TODO :: status bar up ');
    } else {
      const lostWidth = maxWidth * (-diff / max);
      diffGraphics.x = graphics.x + graphics.width;
      diffGraphics.lineStyle(2, 0xa81b2e, 1);
      diffGraphics.lineTo(lostWidth, 0);

      let idx = 0;
      const { ticker } = IApplication.get();
      const tick = () => {
        if (diffGraphics.y > 5) {
          ticker.remove(tick);
          diffGraphics.destroy();
          container.removeChild(diffGraphics);
          return;
        }
        idx += 1;
        if (idx % 5 !== 0) {
          return;
        }
        diffGraphics.y += 1;
        diffGraphics.clear();
        diffGraphics.lineStyle(2, 0x2e060c, 1 - (diffGraphics.y / 5));
        diffGraphics.lineTo(lostWidth, 0);
      };
      ticker.add(tick);
    }

    container.addChild(graphics);
    container.addChild(diffGraphics);
  },

};

export default IStatusBarBasic;
