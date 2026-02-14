export const BUILT_IN_SERVER_MESSAGE_TYPES = {
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
  EFFECT_JUMP: 'effect.jump',
  DEBUGGER_HIGHLIGHT: 'debugger.highlight',
  CAMERA_FOCUS: 'camera.focus',
  CAMERA_FOLLOW: 'camera.follow',
};

export const BUILT_IN_CLIENT_MESSAGE_TYPES = {
  // SHARD_LOAD: 'shard.load',
  SHARD_LOADED: 'shard.loaded',
  // OBJECT_MOVE: 'object.move',
  CONTROLLER_MOVE: 'controller.move',
  CONTROLLER_INTERACT: 'controller.interact',
  CONTROLLER_ACTION: 'controller.action',
};
