
import { ControllerReceiver } from './controller.js';
import { BUILT_IN_CLIENT_MESSAGE_TYPES } from '@iyagi/commons';

/**
 * @typedef {{
 *  user: import('../user/index.js').User;
 *  message: import('@iyagi/client/const').ClientMessage;
 * }} ClientPayload
 */

export class ServerHandler {
  /**
   * @param {ClientPayload} payload
   */
  receive({ user, message }) {
    switch(message.type) {
      case BUILT_IN_CLIENT_MESSAGE_TYPES.SHARD_LOADED:
        user.shard.loaded$.next(user);
        return;
      case BUILT_IN_CLIENT_MESSAGE_TYPES.CONTROLLER_MOVE:
        ControllerReceiver.move(user, message);
        return;
      case BUILT_IN_CLIENT_MESSAGE_TYPES.CONTROLLER_INTERACTION:
        ControllerReceiver.interact(user, message);
        return;
      case BUILT_IN_CLIENT_MESSAGE_TYPES.CONTROLLER_ACTION:
        ControllerReceiver.action(user, message);
        return;
      default:
        console.error('server receive unknown message', message);
    }
  }
}
