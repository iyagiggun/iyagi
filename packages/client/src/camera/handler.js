import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import camera from './index.js';

export const CLIENT_CAMERA_MESSAGE_HANDLER = {
  [BUILT_IN_SERVER_MESSAGE_TYPES.CAMERA_FOCUS]:
    (data) => camera.move(data),
  [BUILT_IN_SERVER_MESSAGE_TYPES.CAMERA_FOLLOW]:
    (data) => camera.follow(data),
};
