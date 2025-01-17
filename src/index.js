/**
 * @typedef {Object} Server
 * @property {(type: string, handler: () => void) => void} on
 */

import global from './global.js';
import { onSceneEvent } from './scene/handler.js';
import { ServerTeller } from './teller/index.js';


/////////// TODO: IServer 를 통해서 send 와 reply 하도록 할 것
/**
 * @typedef {Object} IServerParams
 * @property {function(*): void} send
 * @property {import('./scene/index.js').default[]} scenes
 */
export default class IServer {

  /**
   * @param {IServerParams} param0
   */
  constructor({
    send,
    scenes,
  }) {
    this.send = send;
    this.teller = new ServerTeller(send);
    global.init({
      scenes,
    });
  }

  /**
   * @param {Object} param
   * @param {string} param.type
   * @param {*} param.data
   * @param {import('./user/index.js').default} param.user
   */
  respond({
    type,
    data,
    user,
  }) {
    const msg = onSceneEvent({ user, type, data });
    if (!msg) {
      return;
    }
    this.send(msg);
  }
}
