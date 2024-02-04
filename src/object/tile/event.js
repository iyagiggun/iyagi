const { IObjectEvent } = require('../event');

/**
 * @typedef {(object: import('../').IObject) => void} InOutHandler
 */

class ITileEvent extends IObjectEvent {
  /** @type {InOutHandler | null} */
  in = null;

  /** @type {InOutHandler | null} */
  out = null;
}

export { ITileEvent };
