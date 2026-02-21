import global from './global/index.js';
import handler from './handler/index.js';
import imessenger from './messenger/imessenger.js';
import sender from './sender/index.js';
import { shard } from './shard/index.js';

global.messenger = imessenger;

const iclient = {
  /**
   * @param {Object} p
   * @param {WebSocket} p.websocket
   * @param {import('./handler/index.js').ClientHandlerMap} [p.handlerMap]
   */
  async init({ websocket, handlerMap }) {

    sender.init(websocket);
    handler.init(websocket, handlerMap);

    await global.init();

    global.app.stage.addChild(shard.container);

    // Pixi.js 애플리케이션 자동 리사이즈 처리 (옵션)
    // window.addEventListener('resize', () => {
    //   app.renderer.resize(window.innerWidth, window.innerHeight);
    //   container.width = app.screen.width;
    //   container.height = app.screen.height;
    //   container.hitArea = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height);
    // });
  },

  get send() {
    return sender.send;
  },

  get application() {
    return global.app;
  },
};

export default iclient;
