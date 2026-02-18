import { shard_container } from '../const/index.js';

/**
 * @type {import('../object/index.js').ClientObjectType[]}
 */
const _objects = [];

export const shard = {
  objects: {
    /**
     * @param {import('../object/index.js').ClientObjectType} obj
     */
    async add(obj) {
      await obj.load();
      _objects.push(obj);
      shard_container.addChild(obj.container);
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
  },
  load: {
    /**
     * Override as needed.
     * @param {import('pixi.js').Container} container
     */
    // eslint-disable-next-line no-unused-vars
    before: (container) => Promise.resolve(),
    /**
     * Override as needed.
     * @param {import('pixi.js').Container} container
     */
    // eslint-disable-next-line no-unused-vars
    after: (container) => Promise.resolve(),
  },
  clear: {
    /**
     * Override as needed.
     * @param {import('pixi.js').Container} container
     */
    // eslint-disable-next-line no-unused-vars
    before: (container) => Promise.resolve(),
    /**
     * Override as needed.
     * @param {import('pixi.js').Container} container
     */
    // eslint-disable-next-line no-unused-vars
    after: (container) => Promise.resolve(),
  },
};
