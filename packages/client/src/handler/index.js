import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { CLIENT_CAMERA_MESSAGE_HANDLER } from '../camera/handler.js';
import { CLIENT_DEBUGGER_MESSAGE_HANDLER } from '../debug/handler.js';
import { CLIENT_EFFECT_MESSAGE_HANDLER } from '../effect/handler.js';
import { CLIENT_OBJECT_MESSAGE_HANDLER } from '../object/handler.js';
import { shard } from '../shard/index.js';

/**
 * @typedef { { [key: string]: Function } } ClientHandlerMap
 */


/**
 * @type {ClientHandlerMap}
 */
const BASIC_HANDLER_MAP = {
  [BUILT_IN_SERVER_MESSAGE_TYPES.SHARD_LOAD]:
    (data) => {
      shard.clear();
      return shard.load(data);
    },
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
        /** @type {import("@iyagi/server/const").ServerMessage[]} */
        const messages = JSON.parse(event.data);
        console.info('client receive', messages);
        for (const msg of messages) {
          const handler = handlerMap[msg.type] || BASIC_HANDLER_MAP[msg.type];
          if (!handler) {
            throw new Error(`No handler for message type: ${msg.type}`);
          }
          await handler(msg.data);
        }
      }
    );
  },
};

export default handler;
