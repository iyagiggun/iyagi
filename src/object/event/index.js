/**
 * @typedef {() => void} TapHandler
 */

class IObjectEvent {
  #container;

  /** @type {TapHandler | null} */
  #tap = null;

  /**
   * @param {import('../').IObject} obj
   */
  constructor(obj) {
    this.#container = obj.container;
  }

  /**
   * @param {TapHandler | null} handler
   */
  set tap(handler) {
    if (!handler) {
      this.#container.eventMode = 'none';
      this.#container.ontap = null;
      this.#tap = null;
      return;
    }
    if (this.#container.eventMode !== 'static') {
      this.#container.eventMode = 'static';
    }
    this.#tap = handler;
    this.#container.ontap = this.#tap;
  }

  get tap() {
    return this.#tap;
  }
}

export { IObjectEvent };
