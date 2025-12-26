import { concatMap, from, mergeMap, Subject } from 'rxjs';
import camera from '../camera/index.js';
import { CLIENT_OBJECT_MESSAGE_HANDLER } from '../object/operator.js';
import { shard } from '../shard/index.js';
import { CLIENT_EFFECT_MESSAGE_HANDLER } from '../effect/index.js';
import { CLIENT_DEBUGGER_MESSAGE_HANDLER } from '../debugger/index.js';
import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';

/**
 * @typedef {Object} ServerPayload
 * @property {import('@iyagi/server/const').ServerMessage} p.message
 */

const BASIC_HANDLER_MAP = {
  [BUILT_IN_SERVER_MESSAGE_TYPES.SHARD_LOAD]:
    /**
     * @param {import('@iyagi/server/const').ServerMessage} message
     */
    (message) => {
      shard.clear();
      return shard.load(message);
    },
  ...CLIENT_OBJECT_MESSAGE_HANDLER,
  ...CLIENT_EFFECT_MESSAGE_HANDLER,
  ...CLIENT_DEBUGGER_MESSAGE_HANDLER,
  [BUILT_IN_SERVER_MESSAGE_TYPES.CAMERA_FOCUS]:
    /**
     * @param {import('@iyagi/server/const').ServerMessage} message
     */
    (message) => camera.move(message.data),
  [BUILT_IN_SERVER_MESSAGE_TYPES.WAIT]:
    /**
     * @param {import('@iyagi/server/const').ServerMessage} message
     */
    (message) => {
      return new Promise((resolve) => {
        window.setTimeout(resolve, message.data.delay);
      });
    },
};

/**
 * @type {Subject<{ message: import('@iyagi/server/const').ServerMessage[]}>}
 */
export const payload$ = new Subject();

payload$
  .pipe(
    mergeMap(({ message }) => {
      return from(message).pipe(
        concatMap(async(sMessage) => {
          const handler = BASIC_HANDLER_MAP[sMessage.type];
          if (!handler) {
            throw new Error(`No handler for message type: ${sMessage.type}`);
          }
          await handler(sMessage);
        })
      );
    })
  ).subscribe();
