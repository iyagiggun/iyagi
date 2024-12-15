
export default class IUser {
  /**
   * @type {import('../object/index.js').IObject[]}
   */
  objects = [];
  /**
   * @param {string} key
   */
  constructor(key) {
    this.key = key;
    this.scene = '';
  }
}
