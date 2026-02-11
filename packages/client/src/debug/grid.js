import { Graphics } from 'pixi.js';
import { shard_container } from '../const/index.js';

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
    for (let idx = -halfLineCount; idx <= halfLineCount; idx++) {
      if (idx === 0) continue;
      const y = idx * unit;
      g.moveTo(-unit * halfLineCount, y);
      g.lineTo(unit * halfLineCount, y);
    }

    // draw Y line
    for (let idx = -halfLineCount; idx <= halfLineCount; idx++) {
      if (idx === 0) continue;
      const x = idx * unit;
      g.moveTo(x, -unit * halfLineCount);
      g.lineTo(x, unit * halfLineCount);
    }

    g.stroke({
      color: 0xffffff,
      pixelLine: true,
      width: 1,
    });

    // draw axis lines (x=0, y=0) in black
    g.moveTo(-unit * halfLineCount, 0);
    g.lineTo(unit * halfLineCount, 0);
    g.moveTo(0, -unit * halfLineCount);
    g.lineTo(0, unit * halfLineCount);

    g.stroke({
      color: 0xff0000,
      pixelLine: true,
      width: 1,
    });

    shard_container.addChild(g);
  },
};
