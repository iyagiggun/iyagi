export const FRAMES_PER_SECOND = 60;
export const DEFAULT_ANIMATION_SPEED = 6 / FRAMES_PER_SECOND; // 10 fps

/**
 * @typedef {Object} ServerMessage
 * @property {string} type
 * @property {*} [data]
 */

/**
 * @typedef {(message: ServerMessage[]) => void} ServerReply
 */

/**
 * @typedef {Object} ServerPayload
 * @property {import('../user/index.js').User} user
 * @property {import('../shard/index.js').Shard} shard
 * @property {ServerReply} reply
 */

