import { BUILT_IN_CLIENT_MESSAGE_TYPES, BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { CLIENT_CAMERA_MESSAGE_HANDLER } from '../camera/handler.js';
import { CLIENT_DEBUGGER_MESSAGE_HANDLER } from '../debug/handler.js';
import { CLIENT_EFFECT_MESSAGE_HANDLER } from '../effect/handler.js';
import { CLIENT_OBJECT_MESSAGE_HANDLER } from '../object/handler.js';
import { CLIENT_SHARD_MESSAGE_HANDLER } from '../shard/handler.js';
import sender from '../sender/index.js';

/**
 * @typedef { { [key: string]: Function } } ClientHandlerMap
 */


/**
 * @type {ClientHandlerMap}
 */
const BASIC_HANDLER_MAP = {
  ...CLIENT_SHARD_MESSAGE_HANDLER,
  ...CLIENT_OBJECT_MESSAGE_HANDLER,
  ...CLIENT_EFFECT_MESSAGE_HANDLER,
  ...CLIENT_DEBUGGER_MESSAGE_HANDLER,
  ...CLIENT_CAMERA_MESSAGE_HANDLER,
  [BUILT_IN_SERVER_MESSAGE_TYPES.WAIT]:
    (data) => {
      return new Promise((resolve) => {
        window.setTimeout(resolve, data.delay);
      });
    },
};

const handler = {
  /**
   * @param {WebSocket} ws
   * @param {ClientHandlerMap} [handlerMap = {}]
   */
  init(ws, handlerMap = {}) {
    ws.addEventListener('message',
      /**
       * @param {MessageEvent} event
       */
      async (event) => {
        const payload = JSON.parse(event.data);
        console.info('client receive', payload);
        for (const msg of payload.messages) {
          const handler = handlerMap[msg.type] || BASIC_HANDLER_MAP[msg.type];
          if (!handler) {
            throw new Error(`No handler for message type: ${msg.type}`);
          }
          await handler(msg.data);
        }
        if (payload.callback) {
          sender.send({
            type: BUILT_IN_CLIENT_MESSAGE_TYPES.CALLBACK,
          });
        }
      }
    );
  },
};

export default handler;
