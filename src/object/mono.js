const { default: IObject } = require('./base');

/**
 * @typedef ISimpleObjectParameter
 * @property {string} name
 * @property {string} image
 * @property {import('../utils/coordinates').Area[]} [frames]
 * @property {import('../utils/coordinates').Area} [hitbox]
 * @property {number} [z]
 */

class IMonoObject extends IObject {
  /**
   * @param {ISimpleObjectParameter} p
   */
  constructor({
    name, image, frames, hitbox, z,
  }) {
    super({
      name,
      image,
      motions: {
        default: {
          down: {
            frames,
          },
          hitbox,
        },
      },
      z,
    });
  }
}

export default IMonoObject;
