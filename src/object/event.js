import { EventEmitter } from 'pixi.js';

/**
 * @typedef {{ target: import('./index').IObject }} IObjectEventTapData
 */

class IObjectEvent {
  #object;

  #ee = new EventEmitter();

  /**
   * @param {import('./index').IObject} object
   */
  constructor(object) {
    this.#object = object;
    this.#object.container.on('tap', () => {
      this.#ee.emit('tap', { object });
    });
  }

  /**
   * @param {string} type
   * @param {(data: any) => void} handler
   */
  on(type, handler) {
    this.#object.container.eventMode = 'static';
    this.#ee.on(type, handler);
  }

  /**
   * @param {string} type
   * @param {(data: any) => void} handler
   */
  off(type, handler) {
    this.#ee.off(type, handler);
    if (this.#ee.eventNames().length === 0) {
      this.#object.container.eventMode = 'static';
    }
  }

  /**
   * @param {string} type
   * @param {any} data
   */
  emit(type, data) {
    return this.#ee.emit(type, data);
  }
}

export default IObjectEvent;
