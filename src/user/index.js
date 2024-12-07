
export default class IUser {
  /**
   * @type {import('../object/index.js').default[]}
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
