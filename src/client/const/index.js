export const FRAMES_PER_SECOND = 60;
export const DEFAULT_ANIMATION_SPEED = 6 / FRAMES_PER_SECOND;

/**
 * @typedef { 'shard.load'
 * | 'shard.loaded'
 * | 'controller.move'
 * | 'controller.interaction'
 * | 'controller.action'
 * | 'object.action'
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
