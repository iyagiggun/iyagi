import EventEmitter from 'events';
import IStatusBarBasic from './bar';

/**
 * @template T
 */

class IStatus {
  status;

  #ee = new EventEmitter();

  /**
   * @param {T} initData
   */
  constructor(initData) {
    this.status = { ...initData };
  }

  get() {
    return {
      ...this.status,
    };
  }

  /**
     * @param {Partial<T>} next
     */
  set(next) {
    const before = this.get();
    const after = { ...this.status, ...next };
    this.#ee.emit('before-change', { before, after });
    this.status = after;
    this.#ee.emit('change', { before, after: this.get() });
  }

  /**
   * @typedef {(
   *    key: 'change',
   *    handler: (data: { before: T, after: T }) => void
   *  ) => void
   * } ChangeHandler
   * @typedef {(
   *    key: 'before-change',
   *    handler: (before: number) => void
   *  ) => void
   * } BeforeChangeHandler
   */

  /**
   * @type {ChangeHandler}
   */
  on(key, handler) {
    this.#ee.on(key, handler);
  }
}

export default IStatus;

export { IStatusBarBasic };
