export const BUILT_IN_SERVER_MESSAGE_TYPES = {
  WAIT: 'wait',
  SHARD_JOIN: 'shard.join',
  SHARD_LEAVE: 'shard.leave',
  SHARD_LOAD: 'shard.load',
  OBJECT_MOVE: 'object.move',
  OBJECT_TALK: 'object.talk',
  OBJECT_ACTION: 'object.action',
  OBJECT_REMOVE: 'object.remove',
  EFFECT_JUMP: 'effect.jump',
  DEBUGGER_HIGHLIGHT: 'debugger.highlight',
  CAMERA_FOCUS: 'camera.focus',
  CAMERA_FOLLOW: 'camera.follow',
};

export const BUILT_IN_CLIENT_MESSAGE_TYPES = {
  CALLBACK: 'callback',
  // SHARD_LOAD: 'shard.load',
  SHARD_LOADED: 'shard.loaded',
  SHARD_INTERACT: 'shard.interact',
  // OBJECT_MOVE: 'object.move',
  CONTROLLER_MOVE: 'controller.move',
  CONTROLLER_ACTION: 'controller.action',
};
