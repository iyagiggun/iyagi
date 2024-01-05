import IStatusBarBasic from './bar';

/**
 * @template T
 */
class IStatus {
  status;

  /**
   * @param {T} initData
   */
  constructor(initData) {
    this.status = { ...initData };
  }

  events = {
    /** @type {((p: { before: T, after: T}) => void) | null} */
    onBeforeChange: null,
    /** @type {((p: { before: T, after: T}) => void) | null} */
    onChange: null,
  };

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
    if (typeof this.events.onBeforeChange === 'function') {
      this.events.onBeforeChange({ before, after });
    }
    this.status = after;
    if (typeof this.events.onChange === 'function') {
      this.events.onChange({ before, after });
    }
  }
}

export default IStatus;

export { IStatusBarBasic };
