import IObject from '..';

const ITile = {
  /**
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
