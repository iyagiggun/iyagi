import EventEmitter from 'events';
import IStatusBarBasic from './bar';

const IStatus = {
  /**
   * @template T
   * @param {T} init
   */
  create: (init) => {
    const ee = new EventEmitter();

    let status = {
      ...init,
    };

    const get = () => ({
      ...status,
    });

    /**
     * @param {Partial<T>} next
     */
    const set = (next) => {
      const before = get();
      const after = { ...status, ...next };
      ee.emit('before-change', { before, after });
      status = after;
      ee.emit('change', { before, after: get() });
    };

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

    return Object.freeze({
      get,
      set,
      /**
       * @type {ChangeHandler & BeforeChangeHandler}
       */
      on: (key, handler) => {
        ee.on(key, handler);
      },
    });
  },
};

export default IStatus;

export { IStatusBarBasic };
