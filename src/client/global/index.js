import { Application } from 'pixi.js';

/**
 * @typedef {{
*  container: import('pixi.js').Container;
*  target: import('../object/index.js').default | null;
*  release: () => void;
* }} Controller
*/

/** @type { Application= } */
let app;
/** @type { Controller | null } */
let controller = null;
/** @type {import('../messenger/index.js').Messenger} */
let messenger;

const ERR_NOT_INITED = 'client has not been initialized yet.';

export default {
  get app() {
    if (!app) {
      throw new Error(ERR_NOT_INITED);
    }
    return app;
  },
  get controller() {
    return controller;
  },
  /**
   * @type {Controller} _
   */
  set controller(_) {
    controller = _;
  },
  get messenger() {
    if (!messenger) {
      throw new Error(ERR_NOT_INITED);
    }
    return messenger;
  },

  /**
   * @param {Object} p
   * @param {import('../messenger/index.js').Messenger} p.messenger
   */
  async init({
    messenger: _messenger,
  }) {
    app = new Application();
    await app.init({
      backgroundColor: 0x000000,
      resizeTo: window,
    });
    document.body.appendChild(app.canvas);
    messenger = _messenger;
  },
};
