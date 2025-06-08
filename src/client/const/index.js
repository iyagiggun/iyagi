export const FRAMES_PER_SECOND = 60;
export const DEFAULT_ANIMATION_SPEED = 6 / FRAMES_PER_SECOND; // 10 fps

/**
 * @typedef { 'wait'
 * | 'list'
 * | 'shard.load'
 * | 'shard.loaded'
 * | 'shard.clear'
 * | 'object.move'
 * | 'object.talk'
 * | 'object.control'
 * | 'object.release'
 * | 'object.remove'
 * | 'object.motion'
 * | 'object.interact'
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
 * } ClientMessageType
 */

/**
 * @typedef {Object} ClientMessage
 * @property {ClientMessageType} type
 * @property {*} [data]
 */

