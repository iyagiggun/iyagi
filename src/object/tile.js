import EventEmitter from 'events';
import IMonoObject from './mono';

class ITile extends IMonoObject {
  #ee = new EventEmitter();

  /**
   * @param {import('./mono').IMonoObjectParameter} p
   */
  constructor(p) {
    super({
      ...p,
      z: 0,
    });
  }

  /**
   * @param {string} key
   */
  hasHandler(key) {
    if (!key) {
      return this.#ee.eventNames().length > 0;
    }
    return this.#ee.eventNames().includes(key);
  }

  /**
   * @param {'in' | 'out'} eventName
   * @param {{ target: IObject }} data
   */
  emit(eventName, data) {
    this.#ee.emit(eventName, data);
  }

  /**
   * @param {'in' | 'out'} eventName
   * @param {(data: { target: IObject }) => void } handler
   */
  on(eventName, handler) {
    this.#ee.on(eventName, handler);
  }

  /**
   * @param {'in' | 'out'} eventName
   * @param {(data: { target: IObject }) => void } handler
   */
  once(eventName, handler) {
    this.#ee.once(eventName, handler);
  }
}

export default ITile;
