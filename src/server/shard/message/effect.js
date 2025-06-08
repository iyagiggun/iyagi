import { IMT } from '../../../const/message.js';

const ShardEffectMessage = {
  /**
   * @typedef {import('../../../coords/index.js').IObject | import('../index.js').Shard} Target
   * @param {Target | Target[]} target
   * @param {*} [options]
   */
  fadeIn(target, options) {
    return {
      type: IMT.EFFECT_FADE_IN,
      data: {
        target: (Array.isArray(target) ? target : [target]).map((t) => t.id),
        ...options,
      },
    };
  },
  /**
   * @typedef {import('../../../coords/index.js').IObject | import('../index.js').Shard} Target
   * @param {Target | Target[]} target
   * @param {*} [options]
   */
  fadeOut(target, options) {
    return {
      type: IMT.EFFECT_FADE_OUT,
      data: {
        target: (Array.isArray(target) ? target : [target]).map((t) => t.id),
        ...options,
      },
    };
  },
};

export { ShardEffectMessage };
