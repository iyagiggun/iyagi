import { concatMap, from, mergeMap, Subject } from 'rxjs';
import { BASIC_SERVER_MESSAGE_TYPES } from '../../server/const/index.js';
import camera from '../camera/index.js';
import { CLIENT_OBJECT_MESSAGE_HANDLER } from '../object/operator.js';
import { shard } from '../shard/index.js';
import { CLIENT_EFFECT_MESSAGE_HANDLER } from '../effect/index.js';
import { CLIENT_SUPERVISOR_MESSAGE_HANDLER } from '../supervisor/index.js';

/**
 * @typedef {Object} ServerPayload
 * @property {import('../../server/const/index.js').ServerMessage} p.message
 */

const BASIC_HANDLER_MAP = {
  [BASIC_SERVER_MESSAGE_TYPES.SHARD_LOAD]:
    /**
     * @param {import('../../server/const/index.js').ServerMessage} message
     */
    (message) => {
      shard.clear();
      return shard.load(message);
    },
  ...CLIENT_OBJECT_MESSAGE_HANDLER,
  ...CLIENT_EFFECT_MESSAGE_HANDLER,
  ...CLIENT_SUPERVISOR_MESSAGE_HANDLER,
  [BASIC_SERVER_MESSAGE_TYPES.CAMERA_FOCUS]:
    /**
     * @param {import('../../server/const/index.js').ServerMessage} message
     */
    (message) => camera.move(message.data),
  [BASIC_SERVER_MESSAGE_TYPES.WAIT]:
    /**
     * @param {import('../../server/const/index.js').ServerMessage} message
     */
    (message) => {
      return new Promise((resolve) => {
        window.setTimeout(resolve, message.data.delay);
      });
    },
};

/**
 * @type {Subject<{ message: import('../../server/const/index.js').ServerMessage[]}>}
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
