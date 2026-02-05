import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import camera from './index.js';

export const CLIENT_CAMERA_MESSAGE_HANDLER = {
  [BUILT_IN_SERVER_MESSAGE_TYPES.CAMERA_FOCUS]:
    /**
     * @param {import('@iyagi/server/const').ServerMessage} message
     */
    (message) => camera.move(message.data),
  [BUILT_IN_SERVER_MESSAGE_TYPES.CAMERA_FOLLOW]:
    /**
     * @param {import('@iyagi/server/const').ServerMessage} message
     */
    (message) => camera.follow(message.data),
};
