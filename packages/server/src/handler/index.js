
import { ControllerHandler } from './controller.js';
import { BUILT_IN_CLIENT_MESSAGE_TYPES } from '@iyagi/commons';

/**
 * @typedef {{
 *  user: import('../user/index.js').User;
 *  message: import('@iyagi/client/const').ClientMessage;
 * }} ClientPayload
 */

const map = new Map([
  ...Object.entries(ControllerHandler),
  [BUILT_IN_CLIENT_MESSAGE_TYPES.SHARD_LOADED, (user) => {
    user.shard.loaded$.next(user);
  }],
]);

export const ServerHandler = {
  /**
   * @param {ClientPayload} payload
   */
  handle({ user, message }) {
    const handler = map.get(message.type);

    if (!handler) {
      throw new Error(`No handler for message type: ${message.type}`);
    }
    handler(user, message);
  },
  /**
   * @param {string} type
   * @param {*} handler
   */
  register(type, handler) {
    map.set(type, handler);
  },
};
