import EventEmitter from 'events';
import IObject from '..';

/**
 * @typedef {import('..').IObjectCreated} IObjectCreated
 */

/**
 * @typedef {Object} AdditionalParameter
 * @property {0} [AdditionalParameter.z]
 * @property {boolean} [interactable]
 */

/**
 * @typedef {import('..').IObjectParameter & AdditionalParameter} TileParameter
 */

/**
 * @typedef {ReturnType<typeof ITile.create>} ITileCreated
 */

const ITile = {
  /**
   * z value is fixed to 0.
   * @param {TileParameter} p
   */
  create: (p) => {
    const ee = new EventEmitter();

    const obj = IObject.create({
      ...p,
      z: 0,
    });

    const ret = {
      ...obj,
      hasHandler: (key) => ee.eventNames().includes(key),
      /**
       * @param {'in' | 'out'} eventName
       * @param {{ target: import('..').IObjectCreated }} data
       */
      emit: (eventName, data) => {
        ee.emit(eventName, data);
      },
      /**
       * @param {'in' | 'out'} eventName
       * @param {(data: { target: import('..').IObjectCreated }) => void } handler
       */
      on: (eventName, handler) => {
        ee.on(eventName, handler);
      },
      /**
       * @param {'in' | 'out'} eventName
       * @param {(data: { target: import('..').IObjectCreated }) => void } handler
       */
      once: (eventName, handler) => {
        ee.once(eventName, handler);
      },
    };

    return Object.freeze(ret);
  },
};

export default ITile;
