import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { shard } from './index.js';

export const CLIENT_SHARD_MESSAGE_HANDLER = {
  [BUILT_IN_SERVER_MESSAGE_TYPES.SHARD_LOAD]: (data) => {
    shard.clear();
    return shard.load(data);
  },
};
