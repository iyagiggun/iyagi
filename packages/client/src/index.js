import global from './global/index.js';
import { ObjectConverter } from './object/converter.js';
import { payload$ } from './message/index.js';
import imessenger from './messenger/imessenger.js';

global.messenger = imessenger;

/** @typedef {import('./global/index.js').Controller} Controller */

const iclient = {
  payload$,
  /**
   * @param {Object} p
   * @param {import('./const/index.js').ClientReply} p.reply
   */
  async init(p) {

    await global.init(p);

    // reciever.init(global.ws);

    // Pixi.js 애플리케이션 자동 리사이즈 처리 (옵션)
    // window.addEventListener('resize', () => {
    //   app.renderer.resize(window.innerWidth, window.innerHeight);
    //   container.width = app.screen.width;
    //   container.height = app.screen.height;
    //   container.hitArea = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height);
    // });
  },
  get application() {
    return global.app;
  },
  get reply() {
    return global.reply;
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
