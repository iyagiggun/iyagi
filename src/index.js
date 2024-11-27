/**
 * @typedef {Object} Server
 * @property {(type: string, handler: () => void) => void} on
 */

import global from './global.js';
import { onSceneEvent } from './scene/index.js';

/**
 * @param {import('./global.js').GlobalParams} p
 */
const init = ({
  scenes,
}) => {
  global.init({ scenes });
};

/**
 * @param {Object} param
 * @param {string} param.type
 * @param {*} param.data
 * @param {import('./user/index.js').User} param.user
 */
export const response = ({
  type,
  data,
  user,
}) => {
  return onSceneEvent({ user, type, data });
};

const iserver = {
  init,
  response,
};

export default iserver;
