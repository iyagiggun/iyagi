export const FRAMES_PER_SECOND = 60;
export const DEFAULT_ANIMATION_SPEED = 6 / FRAMES_PER_SECOND; // 10 fps

/**
 * @typedef { 'shard.load'
 * | 'shard.loaded'
 * | 'controller.move'
 * | 'controller.interaction'
 * | 'controller.action'
 * | 'object.motion'
 * } ClientMessageType
 */

/**
 * @typedef {Object} ClientMessage
 * @property {ClientMessageType} type
 * @property {*} [data]
 */

/**
 * @typedef {(message: ClientMessage) => void} ClientReply
 */
