/**
 * @typedef {{
 *  user: import('../user/index.js').User;
 *  message: import('../../client/const/index.js').ClientMessage;
 *  reply: import('../const/index.js').ServerReply
 * }} ClientPayload
 */

import { ControllerReceiver } from './controller.js';

export class ServerReceiver {
  /**
   * @param {ClientPayload} payload
   */
  receive(payload) {
    switch(payload.message.type) {
      case 'shard.load':
        payload.user.shard.load$.next(payload);
        return;
      case 'shard.loaded':
        payload.user.shard.loaded$.next(payload);
        return;
      case 'controller.move':
        ControllerReceiver.move(payload, payload.message);
        return;
      case 'controller.interact':
        ControllerReceiver.interact(payload, payload.message);
        return;
      default:
        console.error('server recieve unknown message', payload.message);
    }
  }
}
