import { Graphics } from 'pixi.js';
import { shard } from '../shard/index.js';
import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';

export const CLIENT_DEBUGGER_MESSAGE_HANDLER = {
  /**
   * @param {import('@iyagi/server/const').ServerMessage} message
   */
  [BUILT_IN_SERVER_MESSAGE_TYPES.DEBUGGER_HIGHLIGHT]: ({ data }) => new Promise((resolve) => {
    /**
     * @type {import('@iyagi/commons/coords').Area}
     */
    const area = data.area;

    const graphics = new Graphics();

    if ('radius' in area) {
      const { x, y, radius } = area;
      graphics.circle(x, y, radius);
      graphics.fill({
        color: 0xff0000,
        alpha: 0.4,
      });
    } else if ('halfW' in area && 'halfH' in area) {
      const { x, y, halfW, halfH } = area;
      const w = halfW * 2;
      const h = halfH * 2;
      graphics.rect(x - halfW, y - halfH, w, h);
      graphics.fill({
        color: 0xff0000,
        alpha: 0.4,
      });
    }

    graphics.zIndex = Number.MAX_SAFE_INTEGER;

    shard.container.addChild(graphics);
    window.setTimeout(() => {
      shard.container.removeChild(graphics);
    }, 1000);

    resolve();
  }
  ),
};
