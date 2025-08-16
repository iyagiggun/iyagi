export const FRAMES_PER_SECOND = 60;
export const DEFAULT_ANIMATION_SPEED = 6 / FRAMES_PER_SECOND; // 10 fps

export const BASIC_SERVER_MESSAGE_TYPES = {
  WAIT: 'wait',
  CONTROL: 'control',
  CONTROL_RELEASE: 'control.release',
  SHARD_LOAD: 'shard.load',
  OBJECT_MOVE: 'object.move',
  OBJECT_TALK: 'object.talk',
  OBJECT_ACTION: 'object.action',
  OBJECT_REMOVE: 'object.remove',
  EFFECT_FADE_IN: 'effect.fade.in',
  EFFECT_FADE_OUT: 'effect.fade.out',
  EFFECT_SHAKE: 'effect.shake',
  CAMERA_FOCUS: 'camera.focus',
};

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

