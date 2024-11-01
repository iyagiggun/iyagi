
class UserClass {
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

/**
 * @typedef {UserClass} User
 */

/**
 * @type {Map<string, UserClass>}
 */
const pool = new Map();

const user = new UserClass('1');
pool.set(user.key, user);

const UserUtils = {
  /**
   * @param {string} key
   */
  find: (key) => {
    const user = pool.get(key);
    if (!user) {
      throw new Error(`Fail to find user. key = ${key}`);
    }
    return user;
  },
};

export default UserUtils;
