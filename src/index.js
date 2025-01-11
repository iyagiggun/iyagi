/**
 * @typedef {Object} Server
 * @property {(type: string, handler: () => void) => void} on
 */

import global from './global.js';
import { onSceneEvent } from './scene/index.js';
import { ServerTeller } from './teller/index.js';


/////////// TODO: IServer 를 통해서 send 와 reply 하도록 할 것
/**
 * @typedef {Object} IServerParams
 * @property {function(*): void} send
 */
export class IServer {

  /**
   * @param {IServerParams} param0
   */
  constructor({
    send,
  }) {
    this.send = send;
    this.teller = new ServerTeller(send);
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

/**
 * @param {import('./global.js').GlobalParams} p
 */
const init = ({
  scenes,
}) => {
  global.init({ scenes });
};

const iserver = {
  init,
};

export default iserver;
