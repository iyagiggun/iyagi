import { Application } from 'pixi.js';
import imessenger from '../messenger/imessenger.js';

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

  /**
   * @type {Controller | null}
   */
  controller: null,

  /**
   * @type {import('../messenger/index.js').Messenger}
   */
  messenger: imessenger,

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
  },
};
