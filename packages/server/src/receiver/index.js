
import { ShardForge } from '../shard/forge.js';
import { ControllerReceiver } from './controller.js';
import { BUILT_IN_CLIENT_MESSAGE_TYPES } from '@iyagi/commons';

/**
 * @typedef {{
 *  user: import('../user/index.js').User;
 *  message: import('@iyagi/client/const').ClientMessage;
 * }} ClientPayload
 */

export class ServerReceiver {
  /**
   * @param {ClientPayload} payload
   */
  receive({ user, message }) {
    const shard = ShardForge.seek(user.shard);
    switch(message.type) {
      case BUILT_IN_CLIENT_MESSAGE_TYPES.SHARD_LOADED:
        shard.loaded$.next(user);
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
        console.error('server recieve unknown message', message);
    }
  }
}
