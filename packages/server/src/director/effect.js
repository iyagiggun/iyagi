import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { Shard } from '../shard/index.js';
import { ServerObject } from '../object/index.js';

/**
 * @typedef {Shard | ServerObject} EffectTarget
 */

/**
 * @param {EffectTarget} target
 */
const toClientEffectTarget = (target) => {
  if (target instanceof Shard) {
    return {
      type: 'SHARD',
    };
  }
  if (target instanceof ServerObject) {
    return {
      type:'OBJECT',
      id: target.id,
    };
  }
  throw new Error('Unknown target type: ' + target);
};

export const EffectDirector = {
  /**
   * @param {Shard | ServerObject} target
   * @param {*} [options]
   * @returns {import('../const/index.js').ServerMessage}
   */
  fadeIn(target, options) {
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.EFFECT_FADE_IN,
      data: {
        target: toClientEffectTarget(target),
        ...options,
      },
    };
  },
  /**
   * @param {Shard | ServerObject} target
   * @param {*} [options]
   * @returns {import('../const/index.js').ServerMessage}
   */
  fadeOut(target, options) {
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.EFFECT_FADE_OUT,
      data: {
        target: toClientEffectTarget(target),
        ...options,
      },
    };
  },
  /**
   * @param {Shard | ServerObject} target
   * @param {*} [options]
   * @returns {import('../const/index.js').ServerMessage}
   */
  shake(target, options) {
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.EFFECT_SHAKE,
      data: {
        target: toClientEffectTarget(target),
        ...options,
      },

    };
  },
  /**
   * @param {Shard | ServerObject} target
   * @param {*} [options]
   * @returns {import('../const/index.js').ServerMessage}
   */
  jump(target, options) {
    return {
      type: BUILT_IN_SERVER_MESSAGE_TYPES.EFFECT_JUMP,
      data: {
        target: toClientEffectTarget(target),
        ...options,
      },
    };
  },
};
