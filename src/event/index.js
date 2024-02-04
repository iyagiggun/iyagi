/* eslint-disable no-param-reassign */

/**
 * @template P
 * @param {(p:P) => void} initFunction
 */
const createEventType = (initFunction) => {
  /**
   * @type {(p:P) => void}
   */
  let _action = initFunction;

  const ret = {
    /**
     * @param {(p: P) => void} action
     */
    bind: (action) => {
      if (typeof action !== 'function') {
        throw new Error('[iyagi] fail to bind action. parameter is not a function.');
      }
      _action = action;
    },
    binded: () => (_action === initFunction ? null : _action),
    /**
     * @param {P} p
     */
    fire: (p) => _action(p),
    release: () => {
      _action = initFunction;
    },
  };

  return ret;
};

/**
 * @param {import('pixi.js').Container} container
 */
const create = (container) => {
  /** @type {(function(): void) | undefined} */
  let tap_action;

  const ret = {
    tap: {
      /**
       * @param {function(): void} action
       */
      bind: (action) => {
        if (typeof action !== 'function') {
          throw new Error('[iyagi] fail to bind action. parameter is not a function.');
        }
        tap_action = action;
        container.eventMode = 'static';
        container.ontap = () => action();
        console.error(container);
        console.error(action);
      },
      binded: () => tap_action ?? null,
      release: () => {
        tap_action = undefined;
        container.eventMode = 'none';
        container.ontap = null;
      },
    },
  };

  return ret;
};

const event = {
  create,
  createEventType,
};

export { event };
