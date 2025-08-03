import { concatMap, from, mergeMap, Subject } from 'rxjs';
import { BASIC_SERVER_MESSAGE_TYPES } from '../../server/const/index.js';
import camera from '../camera/index.js';
import { CLIENT_OBJECT_MESSAGE_HANDLER } from '../object/operator.js';
import { shard } from '../shard/index.js';
import { CLIENT_EFFECT_MESSAGE_HANDLER } from '../effect/index.js';

/**
 * @typedef {Object} ServerPayload
 * @property {import('../const/index.js').ClientReply} p.reply
 * @property {import('../../server/const/index.js').ServerMessage} p.message
 */

const BASIC_HANDLER_MAP = {
  /**
   * @param {ServerPayload} payload
   */
  [BASIC_SERVER_MESSAGE_TYPES.WAIT]: ({ message }) => {
    return new Promise((resolve) => {
      window.setTimeout(resolve, message.data.delay);
    });
  },
  /**
   * @param {ServerPayload} payload
   */
  [BASIC_SERVER_MESSAGE_TYPES.LOAD]: ({ reply, message }) => {
    shard.clear();
    return shard.load(message, reply);
  },
  ...CLIENT_OBJECT_MESSAGE_HANDLER,
  ...CLIENT_EFFECT_MESSAGE_HANDLER,
  /**
   * @param {ServerPayload} payload
   */
  [BASIC_SERVER_MESSAGE_TYPES.CAMERA_FOCUS]: ({ message }) => camera.move(message.data),
};

/**
 * @type {Subject<{ reply: import('../const/index.js').ClientReply, message: import('../../server/const/index.js').ServerMessage[]}>}
 */
export const payload$ = new Subject();

payload$
  .pipe(
    mergeMap(({ reply, message }) => {
      return from(message).pipe(
        concatMap(async (sMessage) => {
          const handler = BASIC_HANDLER_MAP[sMessage.type];
          if (!handler) {
            throw new Error(`No handler for message type: ${sMessage.type}`);
          }
          await handler({ reply, message: sMessage });
        })
      );
    })
  ).subscribe();
