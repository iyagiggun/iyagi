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

/** @type {import('../const/index.js').ClientReply=} */
let reply;


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

  get reply() {
    if (!reply) {
      throw new Error(ERR_NOT_INITED);
    }
    return reply;
  },
  /**
   * @param {import('../const/index.js').ClientReply} next
   */
  set reply(next) {
    reply = next;
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

  /**
   * @param {Object} p
   * @param {import('../const/index.js').ClientReply} p.reply
   */
  async init({
    reply: _reply,
  }) {
    app = new Application();
    await app.init({
      backgroundColor: 0x000000,
      resizeTo: window,
    });
    reply = _reply;

    document.body.appendChild(app.canvas);
    const canvasStyle = app.canvas.style;
    canvasStyle.userSelect = 'none';
    canvasStyle.webkitUserSelect = 'none';
    canvasStyle.touchAction = 'none'; // 터치 스크롤 방지
  },
};
