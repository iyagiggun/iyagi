/**
 * @typedef {Object} Server
 * @property {(type: string, handler: () => void) => void} on
 */

import global from './global.js';
import { message } from './message/index.js';
import { onSceneEvent } from './scene/handler.js';

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
    global.init({
      scenes,
    });
  }

  /**
   * @param {Object} param
   * @param {string} param.type
   * @param {*} param.data
   * @param {import('./user/index.js').User} param.user
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


export const iserver = {
  message,
};
