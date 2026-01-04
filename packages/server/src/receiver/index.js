
import { ControllerReceiver } from './controller.js';
import { BUILT_IN_CLIENT_MESSAGE_TYPES } from '@iyagi/commons';

/**
 * @typedef {{
 *  user: import('../user/index.js').User;
 *  shard: import('../shard/index.js').Shard;
 *  message: import('@iyagi/client/const').ClientMessage;
 * }} ClientPayload
 */

export class ServerReceiver {
  /**
   * @param {ClientPayload} payload
   */
  receive(payload) {
    switch(payload.message.type) {
      case BUILT_IN_CLIENT_MESSAGE_TYPES.SHARD_LOADED:
        payload.shard.loaded$.next(payload.user);
        return;
      case BUILT_IN_CLIENT_MESSAGE_TYPES.CONTROLLER_MOVE:
        ControllerReceiver.move(payload.user, payload.message);
        return;
      case BUILT_IN_CLIENT_MESSAGE_TYPES.CONTROLLER_INTERACTION:
        ControllerReceiver.interact(payload.user, payload.message);
        return;
      case BUILT_IN_CLIENT_MESSAGE_TYPES.CONTROLLER_ACTION:
        ControllerReceiver.action(payload.user, payload.message);
        return;
      default:
        console.error('server recieve unknown message', payload.message);
    }
  }
}
