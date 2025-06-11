/**
 * @typedef {Object} Server
 * @property {(type: string, handler: () => void) => void} on
 */

import global from './global.js';
import { ShardForge } from './shard/forge.js';
import { Shard } from './shard/index.js';
import { ServerReceiver } from './receiver/index.js';

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
}

export { ServerReceiver, ShardForge, Shard };
