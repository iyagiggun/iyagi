export const FRAMES_PER_SECOND = 60;
export const DEFAULT_FPS = 6;
export const DEFAULT_ANIMATION_SPEED = 6 / FRAMES_PER_SECOND;


export const BASIC_CLIENT_MESSAGE_TYPES = {
  SHARD_LOAD: 'shard.load',
  SHARD_LOADED: 'shard.loaded',
};

/**
 * @typedef {Object} ClientMessage
 * @property {string} type
 * @property {*} [data]
 */

/**
 * @typedef {(message: ClientMessage) => void} ClientReply
 */
