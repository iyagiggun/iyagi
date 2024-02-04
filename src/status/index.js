import { event } from '../event';
import { BasicStatusBar } from './bar';

/**
 * @template T
 * @param {T} data
 */
const create = (data) => {
  let _data = data;

  const _event = {
    change: event.createEventType(
      /**
       * @param {Object} p
       * @param {T} p.before
       * @param {T} p.after
       */
      // eslint-disable-next-line no-unused-vars
      ({ before, after }) => undefined,
    ),
  };

  const ret = {
    /**
     * @param {Partial<T>} next
     */
    set: (next) => {
      const before = ret.get();
      const after = { ..._data, ...next };

      _data = after;
      _event.change.fire({ before, after });
    },
    get: () => ({
      ..._data,
    }),
    event: _event,
  };

  return ret;
};

const status = {
  create,
};

export { status, BasicStatusBar };
