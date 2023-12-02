import IObject from '..';

/**
 * @typedef {Object} AdditionalParameter
 * @property {0} [AdditionalParameter.z]
 */

/**
 * @typedef {import('..').IObjectParameter & AdditionalParameter} TileParameter
 */

const ITile = {
  /**
   * z value is fixed to 0.
   * @param {TileParameter} p
   */
  create: (p) => {
    const obj = IObject.create({
      ...p,
      z: 0,
    });
    return {
      ...obj,
    };
  },
};

export default ITile;
