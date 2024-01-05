const { default: IEvents } = require('../../events');

/**
   * @typedef ObjectInOutParameter
   * @property {import("../base").default} target
   */

class ITileEvents extends IEvents {
  #container;

  /**
   * @param {import("pixi.js").Container} container
   */
  constructor(container) {
    super(container);
    this.#container = container;
  }

  /** @type {((p: ObjectInOutParameter) => void) | null} */
  onObjectIn = null;

  /** @type {((p: ObjectInOutParameter) => void) | null} */
  onObjectOut = null;
}

export default ITileEvents;
