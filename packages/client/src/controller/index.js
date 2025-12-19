import { Container } from 'pixi.js';
import Joystick from './joystick.js';
import Pad from './pad.js';

export class IController {

  container = new Container();

  /** @type { import('../object/index.js').default | null } */
  target = null;

  #et = new EventTarget();

  constructor() {
    this.container.eventMode = 'static';

    this.joystick = new Joystick({
      container: this.container,
      rate: 50,
    });

    // this.gesture = new Gesture({
    //   container: this.container,
    //   eventTarget: this.#et,
    // });

    this.pad = new Pad({
      container: this.container,
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
      if (this.pad.isIn(x)) {
        this.pad.activate(evt.pointerId);
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
        this.pad.release(pointerId);
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
    this.pad.release();
  }
}

export default IController;
