import global from './global/index.js';
import { ObjectConverter } from './object/converter.js';
import imessenger from './messenger/imessenger.js';
import sender from './sender/index.js';
import reciever from './receiver/index.js';

global.messenger = imessenger;

/** @typedef {import('./global/index.js').Controller} Controller */

const iclient = {
  /**
   * @param {Object} p
   * @param {WebSocket} p.websocket
   */
  async init({ websocket }) {

    sender.init(websocket);
    reciever.init(websocket);

    await global.init();

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

  get controller() {
    return global.controller;
  },

  /** @param { Controller | null } next */
  set controller(next) {
    const last = global.controller;
    if (last && this.application.stage.children.includes(last.container)) {
      this.application.stage.removeChild(last.container);
    }
    global.controller = next;
  },

  object: {
    get converter() {
      return ObjectConverter.convert;
    },
    /**
     * @param {*} next;
     */
    set converter(next) {
      ObjectConverter.set(next);
    },
  },
};

export default iclient;
