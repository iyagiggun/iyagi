/**
 * @typedef {{
 *  user: import('../user/index.js').User;
 *  shard: import('../shard/index.js').Shard;
 *  message: import('@iyagi/client/const').ClientMessage;
 *  reply: import('../const/index.js').ServerReply
 * }} ClientPayload
 */

import { BASIC_CLIENT_MESSAGE_TYPES } from '@iyagi/client/const';
import { ControllerReceiver } from './controller.js';

export class ServerReceiver {
  /**
   * @param {ClientPayload} payload
   */
  receive(payload) {
    switch(payload.message.type) {
      case BASIC_CLIENT_MESSAGE_TYPES.SHARD_LOAD:
        payload.shard.load$.next(payload);
        return;
      case BASIC_CLIENT_MESSAGE_TYPES.SHARD_LOADED:
        payload.shard.loaded$.next(payload);
        return;
      case 'controller.move':
        ControllerReceiver.move(payload, payload.message);
        return;
      case 'controller.interaction':
        ControllerReceiver.interact(payload, payload.message);
        return;
      case 'controller.action':
        ControllerReceiver.action(payload, payload.message);
        return;
      default:
        console.error('server recieve unknown message', payload.message);
    }
  }
}
