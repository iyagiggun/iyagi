import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { shard } from '../shard/index.js';

export const CLIENT_CAMERA_MESSAGE_HANDLER = {
  [BUILT_IN_SERVER_MESSAGE_TYPES.CAMERA_FOCUS]:
    (data) => shard.camera.move(data),
  [BUILT_IN_SERVER_MESSAGE_TYPES.CAMERA_FOLLOW]:
    (data) => {
      return shard.camera.follow(data.target);
    },
};
