import { BUILT_IN_CLIENT_MESSAGE_TYPES } from '@iyagi/commons';

export const SHARD_HANDLER = {
  /**
   * @param {import('../user/index.js').UserType} user
   */
  [BUILT_IN_CLIENT_MESSAGE_TYPES.SHARD_INTERACT]: (user) => {
    if (user.controllable === false) {
      return;
    }
    user.shard.interact(user);
  },
};
