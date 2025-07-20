/**
 * @typedef {{ id: string }} EffectTarget
 */

import { BASIC_SERVER_MESSAGE_TYPES } from '../const/index.js';

export const EffectDirector = {
  /**
   * @param {EffectTarget | EffectTarget[]} target
   * @param {*} [options]
   *
   * @returns {import('../const/index.js').ServerMessage}
   */
  fadeIn(target, options) {
    return {
      type: BASIC_SERVER_MESSAGE_TYPES.EFFECT_FADE_IN,
      data: {
        target: (Array.isArray(target) ? target : [target]).map((t) => t.id),
        ...options,
      },
    };
  },

  /**
   * @param {EffectTarget | EffectTarget[]} target
   * @param {*} [options]
   *
   * @returns {import('../const/index.js').ServerMessage}
   */
  fadeOut(target, options) {
    return {
      type: BASIC_SERVER_MESSAGE_TYPES.EFFECT_FADE_OUT,
      data: {
        target: (Array.isArray(target) ? target : [target]).map((t) => t.id),
        ...options,
      },
    };
  },
};
