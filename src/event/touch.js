/**
 * @typedef {() => void} TapHandler
 */

class TouchEvent {
  #target;

  /** @type {TapHandler | null} */
  #tap = null;

  /**
   * @param {import("pixi.js").DisplayObject} target
   */
  constructor(target) {
    this.#target = target;
  }

  /**
   * @param {TapHandler | null} handler
   */
  set tap(handler) {
    if (!handler) {
      this.#target.eventMode = 'none';
      this.#target.ontap = null;
      this.#tap = null;
      return;
    }
    if (this.#target.eventMode !== 'static') {
      this.#target.eventMode = 'static';
    }
    this.#tap = handler;
    this.#target.ontap = this.#tap;
  }

  get tap() {
    return this.#tap;
  }
}

export { TouchEvent };
