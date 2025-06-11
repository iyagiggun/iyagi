/**
 * @typedef {{ id: string }} EffectTarget
 */

export const EffectCommand = {
  /**
   * @param {EffectTarget | EffectTarget[]} target
   * @param {*} [options]
   * @returns {import('../../const/index.js').ServerMessage}
   */
  fadeIn(target, options) {
    return {
      type: 'effect.fade.in',
      data: {
        target: (Array.isArray(target) ? target : [target]).map((t) => t.id),
        ...options,
      },
    };
  },
  /**
   * @param {EffectTarget | EffectTarget[]} target
   * @param {*} [options]
   * @returns {import('../../const/index.js').ServerMessage}
   */
  fadeOut(target, options) {
    return {
      type: 'effect.fade.out',
      data: {
        target: (Array.isArray(target) ? target : [target]).map((t) => t.id),
        ...options,
      },
    };
  },
};
