
/** @type {{ [name: string]: import('../object/resource.js').default | undefined }} */
const objectsMap = {};

const resource = {
  objects: {
    /**
     * @param {string} name
     */
    contains(name) {
      return !!objectsMap[name];
    },
    /**
     * @param {string} key
     */
    find(key) {
      const obj = objectsMap[key];
      if (!obj) {
        throw new Error(`Fail to get object. key: ${key}`);
      }
      return obj;
    },
    /**
     * @param {import('../object/resource.js').ObjectResourceType} resource
     */
    add(resource) {
      if (objectsMap[resource.key]) {
        throw new Error(`Fail to add resource. Duplicated name(${resource.key}).`);
      }
      objectsMap[resource.key] = resource;
    },
    /**
     * @param {import('../object/resource.js').default[]} list
     */
    addAll(list) {
      list.forEach((obj) => this.add(obj));
    },
  },
};

export default resource;
