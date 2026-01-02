export const FRAMES_PER_SECOND = 60;
export const DEFAULT_FPS = 6;
export const DEFAULT_ANIMATION_SPEED = 6 / FRAMES_PER_SECOND;

/**
 * @typedef {Object} ClientMessage
 * @property {string} type
 * @property {*} [data]
 */

/**
 * @typedef {(message: ClientMessage) => void} ClientReply
 */
