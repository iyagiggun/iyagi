import global from './global/index.js';
import imessenger from './messenger/imessenger.js';
import { ObjectConverter } from './object/converter.js';
import { shard } from './shard/index.js';
import { payload$ } from './message/index.js';

/** @typedef {import('./global/index.js').Controller} Controller */

const iclient = {
  payload$,
  /**
   * @param {Object} [params]
   * @param {Object} [params.object]
   * @param {import('./object/converter.js').ObjectConverterType} [params.object.converter]
   */
  async init(params) {
    await global.init({
      messenger: imessenger,
    });

    const converter = params?.object?.converter;
    if (converter) {
      ObjectConverter.set(converter);
    }

    const app = global.app;

    // reciever.init(global.ws);

    // Pixi.js 애플리케이션 자동 리사이즈 처리 (옵션)
    // window.addEventListener('resize', () => {
    //   app.renderer.resize(window.innerWidth, window.innerHeight);
    //   container.width = app.screen.width;
    //   container.height = app.screen.height;
    //   container.hitArea = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height);
    // });
    app.stage.addChild(shard.container);
    // scene.init();
    // scene.play();
    // inited = true;
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
