import EventEmitter from 'events';
import IObject from '../directional';

/**
 * @typedef {import('../directional').IObjectCreated} IObjectCreated
 */

/**
 * @typedef {Object} AdditionalParameter
 */

/**
 * @typedef {import('../directional').IObjectParameter & AdditionalParameter} TileParameter
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
      /**
       * @param {string} [key]
       */
      hasHandler: (key) => {
        if (!key) {
          return ee.eventNames().length > 0;
        }
        return ee.eventNames().includes(key);
      },
      /**
       * @param {'in' | 'out'} eventName
       * @param {{ target: import('../directional').IObjectCreated }} data
       */
      emit: (eventName, data) => {
        ee.emit(eventName, data);
      },
      /**
       * @param {'in' | 'out'} eventName
       * @param {(data: { target: import('../directional').IObjectCreated }) => void } handler
       */
      on: (eventName, handler) => {
        ee.on(eventName, handler);
      },
      /**
       * @param {'in' | 'out'} eventName
       * @param {(data: { target: import('../directional').IObjectCreated }) => void } handler
       */
      once: (eventName, handler) => {
        ee.once(eventName, handler);
      },
    };

    return Object.freeze(ret);
  },
};

export default ITile;
