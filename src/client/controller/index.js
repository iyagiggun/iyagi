import { Container } from 'pixi.js';
import Joystick from './joystick.js';
import Gesture from './gesture.js';

export default class IController {

  container = new Container();

  joystick;

  gesture;

  /** @type { import('../object/index.js').default | null } */
  target = null;

  #et = new EventTarget();

  constructor() {
    this.container.eventMode = 'static';

    this.joystick = new Joystick({
      container: this.container,
      rate: 50,
      eventTarget: this.#et,
    });

    this.gesture = new Gesture({
      container: this.container,
      eventTarget: this.#et,
    });

    this.container.on('touchstart', (evt) => {
      const { x, y } = evt.global;
      if (this.joystick.isIn(x)) {
        this.joystick.activate({
          pointerId: evt.pointerId,
          start: { x, y },
        });
        return;
      }
      if (this.gesture.isIn(x)) {
        this.gesture.activate(evt.pointerId);
        return;
      }
    });

    /**
     * Touchend and pointerout can occur together.
     * It means that event handler may be executed twice.
     */
    ['touchend', 'pointerout'].forEach((type) => {
      this.container.on(type, (evt) => {
        const { pointerId } = evt;
        this.joystick.release(pointerId);
        this.gesture.release(pointerId);
      });
    });

    this.#et.dispatchEvent(new CustomEvent('dd', { detail: { dd:1 } }));
  }

  /**
   * @param {string} type
   * @param {*} handler
   */
  addEventListener(type, handler) {
    this.#et.addEventListener(type, handler);
  }

  release() {
    console.error('release');
    this.joystick.release();
    this.gesture.release();
  }
}
