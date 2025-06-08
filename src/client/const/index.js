export const FRAMES_PER_SECOND = 60;
export const DEFAULT_ANIMATION_SPEED = 6 / FRAMES_PER_SECOND; // 10 fps

/**
 * @typedef { 'shard.load'
 * | 'shard.loaded'
 * | 'object.move'
 * | 'object.interact'
 * } ClientMessageType
 */

/**
 * @typedef {Object} ClientMessage
 * @property {ClientMessageType} type
 * @property {*} [data]
 */

