/**
 * @type {import("./index.js").default[]}
 */
const objects = [];

export const client_object_manager = {
  /**
   * @param {import("./index.js").default} o
   */
  push: (o) => {
    objects.push(o);
  },
  /**
   * @param {string} id
   */
  find: (id) => {
    const obj = objects.find((obj) => obj.id === id);
    if (!obj) {
      throw new Error('Fail to find object.');
    }
    return obj;
  },
};
