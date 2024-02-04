import { Graphics } from 'pixi.js';

const weakMap = new WeakMap();
const hideTimeoutWeakMap = new WeakMap();

/**
 * @param {import('pixi.js').Container} container
 * @param {string} key
 * @returns
 */
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

/**
 *
 * @param {string} colorString ex. #ff0000
 * @param {number} amount 0 < amount < 1
 * @returns
 */
const getDarkenColor = (colorString, amount) => {
  const hex = colorString.replace(/^#/, '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = Math.floor(r * amount);
  g = Math.floor(g * amount);
  b = Math.floor(b * amount);

  r = Math.min(Math.max(r, 0), 255);
  g = Math.min(Math.max(g, 0), 255);
  b = Math.min(Math.max(b, 0), 255);

  const resultColor = `#${r < 16 ? '0' : ''}${r.toString(16)
  }${g < 16 ? '0' : ''}${g.toString(16)
  }${b < 16 ? '0' : ''}${b.toString(16)}`;

  return resultColor;
};

const BasicStatusBar = {
  /**
   * @param {import('../object/character').ICharacter} character
   * @param {Object} status
   * @param {string} status.key
   * @param {number} status.before
   * @param {number} status.after
   * @param {number} status.max
   * @param {string} status.color
   */
  show: (character, {
    key, before, after, max, color,
  }) => {
    const ticker = character.scene?.iyagi?.application.ticker;
    if (!ticker) {
      return;
    }

    const { container } = character;

    if (hideTimeoutWeakMap.has(container)) {
      window.clearTimeout(hideTimeoutWeakMap.get(container));
    }

    const maxWidth = container.width;
    const diff = after - before;

    const graphics = getGraphics(container, key);
    graphics.clear();
    graphics.x = 0;
    graphics.lineStyle(2, color, 1);
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
        diffGraphics.lineStyle(2, getDarkenColor(color, 0.5), 1 - (diffGraphics.y / 5));
        diffGraphics.lineTo(lostWidth, 0);
      };
      ticker.add(tick);
    }

    container.addChild(graphics);
    container.addChild(diffGraphics);

    hideTimeoutWeakMap.set(container, window.setTimeout(() => { graphics.clear(); }, 5000));
  },
};

export { BasicStatusBar };
