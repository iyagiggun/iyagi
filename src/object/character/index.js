import IObject from '..';

const ICharacter = {
  /**
   * @param {import('./type').ICharacterParameter} p
   */
  create: (p) => {
    const obj = IObject.create(p);
    return {
      ...obj,
    };
  },
};

export default ICharacter;
