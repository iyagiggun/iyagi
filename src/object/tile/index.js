import IObject from '..';

const ITile = {
  /**
   * z value is fixed to 0.
   * @param {import('./type').ITileParameter} p
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
