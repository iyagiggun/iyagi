import { Graphics } from 'pixi.js';
import { BASIC_SERVER_MESSAGE_TYPES } from '@iyagi/server/const';
import { shard } from '../shard/index.js';

export const CLIENT_DEBUGGER_MESSAGE_HANDLER = {
  /**
   * @param {import('../../server/const/index.js').ServerMessage} message
   */
  [BASIC_SERVER_MESSAGE_TYPES.DEBUGGER_HIGHLIGHT]: ({ data }) =>  new Promise((resolve) => {
    const { x, y, w, h } = data.area;

    const area = new Graphics();
    area.rect(0, 0, w, h);
    area.fill({
      color: 0xff0000,
      alpha: 0.4,
    });
    area.x = x;
    area.y = y;
    area.zIndex = Number.MAX_SAFE_INTEGER;

    shard.container.addChild(area);
    window.setTimeout(() => {
      shard.container.removeChild(area);
    }, 1000);

    resolve();
  }
  ),
};

