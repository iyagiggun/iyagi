import { EventEmitter } from 'pixi.js';
import { BasicStatusBar } from './bar';

/**
 * @template T
 */
class IStatus extends EventEmitter {
  #data;

  /**
   * @param {T} data
   */
  constructor(data) {
    super();
    this.#data = data;
  }

  get() {
    return {
      ...this.#data,
    };
  }

  /**
   * @param {Partial<T>} next
   */
  set(next) {
    const before = this.get();
    const after = { ...this.#data, ...next };

    this.#data = after;

    this.emit('change', { before, after });
  }
}

export { BasicStatusBar, IStatus };
