/**
 * @type {import("./index.js").default[]}
 */
const arr = [];

export const objects = {
  /**
   * @param {import("./index.js").default} o
   */
  push: (o) => {
    arr.push(o);
  },
  /**
   * @param {string} id
   */
  find: (id) => {
    const obj = arr.find((obj) => obj.id === id);
    if (!obj) {
      throw new Error('Fail to find object.');
    }
    return obj;
  },
};
