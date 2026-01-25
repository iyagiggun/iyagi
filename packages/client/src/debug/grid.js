import { Graphics } from 'pixi.js';
import { shard } from '../shard';

export const Grid = {
  /**
   * Draw a grid centered at 0,0 with the given unit / width / height.
   * @param {{
   *  unit?: number
   *  halfLineCount?: number
   * }} param0
   */
  on: ({
    unit = 32,
    halfLineCount = 100,
  } = {}) => {
    const g = new Graphics();
    g.zIndex = Number.MAX_SAFE_INTEGER;

    // draw X line
    for (let idx = -halfLineCount ; idx <= halfLineCount ; idx++) {
      const y = idx * unit;
      g.moveTo(-unit * halfLineCount, y);
      g.lineTo(unit * halfLineCount, y);
    }

    // draw Y line
    for (let idx = -halfLineCount ; idx <= halfLineCount ; idx++) {
      const x = idx * unit;
      g.moveTo(x, -unit * halfLineCount);
      g.lineTo(x, unit * halfLineCount);
    }

    g.stroke({
      color: 0xffffff,
      pixelLine: true,
      width: 1,
    });

    shard.container.addChild(g);
  },
};
