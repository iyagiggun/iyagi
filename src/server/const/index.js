export const FRAMES_PER_SECOND = 60;
export const DEFAULT_ANIMATION_SPEED = 6 / FRAMES_PER_SECOND; // 10 fps

/**
 * @typedef { 'wait'
 * | 'list'
 * | 'shard.load'
 * | 'shard.loaded'
 * | 'shard.clear'
 * | 'shard.control'
 * | 'shard.release'
 * | 'shard.remove'
 * | 'object.move'
 * | 'object.talk'
 * | 'object.motion'
 * | 'effect.fade.in'
 * | 'effect.fade.out'
 * | 'scene.load'
 * | 'scene.loaded'
 * | 'scene.object'
 * | 'scene.focus'
 * | 'scene.control'
 * | 'controller.enable'
 * | 'controller.disable'
 * | 'camera.focus'
 * } ServerMessageType
 */

/**
 * @typedef {Object} ServerMessage
 * @property {ServerMessageType} type
 * @property {*} [data]
 */

