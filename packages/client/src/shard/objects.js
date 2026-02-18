/**
 * @type {import('../object/index.js').ClientObjectType[]}
 */
const _objects = [];

/**
 * @param {import('pixi.js').Container} container
 */
export const objects = (container) => {
  return {
    /**
     * @param {import('../object/index.js').ClientObjectType} obj
     */
    async add(obj) {
      await obj.load();
      _objects.push(obj);
      container.addChild(obj.container);
    },
    /**
     * @param {string} id
     */
    find(id) {
      const obj = _objects.find((o) => o.id === id);
      if (!obj) {
        throw new Error(`Object not found: ${id}`);
      }
      return obj;
    },
  };
};

/**
 * @typedef {ReturnType<objects>} ShardObjectsType
 */
