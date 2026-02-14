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

  get messenger() {
    if (!messenger) {
      throw new Error(ERR_NOT_INITED);
    }
    return messenger;
  },

  /**
   * @param {import('../messenger/index.js').Messenger} next
   */
  set messenger(next) {
    messenger = next;
  },

  /**
   * @type {Controller | null}
   */
  controller: null,

  async init() {
    app = new Application();
    await app.init({
      backgroundColor: 0x000000,
      resizeTo: window,
    });

    document.body.appendChild(app.canvas);
    const canvasStyle = app.canvas.style;
    canvasStyle.userSelect = 'none';
    canvasStyle.touchAction = 'none'; // 터치 스크롤 방지
  },
};
