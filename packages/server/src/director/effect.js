import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { Shard } from '../shard/index.js';
import { Obj } from '../object/index.js';

/**
 * @typedef {Shard | Obj} EffectTarget
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
  if (target instanceof Obj) {
    return {
      type: 'OBJECT',
      id: target.id,
    };
  }
  throw new Error('Unknown target type: ' + target);
};

export const EffectDirector = {
  /**
   * @param {Shard | Obj} target
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
