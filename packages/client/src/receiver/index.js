import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { shard } from '../shard';
import { CLIENT_OBJECT_MESSAGE_HANDLER } from '../object/operator';
import { CLIENT_EFFECT_MESSAGE_HANDLER } from '../effect';
import { CLIENT_DEBUGGER_MESSAGE_HANDLER } from '../debugger';
import camera from '../camera';

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

const reciever = {
  /**
   * @param {WebSocket} ws
   */
  init(ws) {
    ws.addEventListener('message',
      /**
       * @param {MessageEvent} event
       */
      (event) => {
        /** @type {import("@iyagi/server/const").ServerMessage[]} */
        const msg_list = JSON.parse(event.data);
        console.info('client receive', msg_list);
        msg_list.forEach(async (msg) => {
          const handler = BASIC_HANDLER_MAP[msg.type];
          if (!handler) {
            throw new Error(`No handler for message type: ${msg.type}`);
          }
          await handler(msg);
        });
      }
    );
  },
};

export default reciever;
