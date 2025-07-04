import { filter, fromEvent, throttleTime } from 'rxjs';

const GESTURE_THRESHOLD = 30;

export default class Gesture {

  #container;

  #et;

  #pointerId = -1;

  /** @type {('→' | '←' | '↑' | '↓')[]} */
  #gestureList = [];

  /**
   * @type {import('../../commons/coords.js').XY | null}
   */
  #last = null;

  /**
   * @param {{
   *  container: import('pixi.js').Container;
   *  eventTarget: EventTarget;
   * }} param0
   */
  constructor({
    container,
    eventTarget,
  }) {
    this.#container = container;
    this.#et = eventTarget;

    fromEvent(this.#container, 'touchmove')
      .pipe(
        filter(() => this.#pointerId !== -1),
        throttleTime(50)
      )
      .subscribe(
        /**
         * @param {import('pixi.js').FederatedPointerEvent} evt
         */
        ({ global: { x, y } }) => this.#check({ x, y })
      );
  }

  /**
   * @param {number} x
   */
  isIn(x) {
    return x > window.innerWidth / 2;
  }

  /**
 * @param {import('../../commons/coords.js').XY} cur
 */
  #check(cur) {
    if (!this.#last) {
      this.#last = cur;
      return;
    }
    const xDelta = cur.x - this.#last.x;
    const xDeltaAbs = Math.abs(xDelta);
    const yDelta = cur.y - this.#last.y;
    const yDeltaAbs = Math.abs(yDelta);

    if (xDeltaAbs > yDeltaAbs && xDeltaAbs > GESTURE_THRESHOLD) {
      const dir = xDelta > 0 ? '→' : '←';
      if (this.#gestureList.length === 0 || this.#gestureList[this.#gestureList.length - 1] !== dir) {
        this.#gestureList.push(dir);
        // info?.eventEmitter.emit(gestureList.join(''));
      }
      this.#last = cur;
      return;
    }
    if (yDeltaAbs > xDeltaAbs && yDeltaAbs > GESTURE_THRESHOLD) {
      const dir = yDelta > 0 ? '↓' : '↑';
      if (this.#gestureList.length === 0 || this.#gestureList[this.#gestureList.length - 1] !== dir) {
        this.#gestureList.push(dir);
        // info?.eventEmitter.emit(gestureList.join(''));
      }
      this.#last = cur;
    }
  }

  /**
   * @param {number} pointerId
   */
  activate(pointerId) {
    this.#pointerId = pointerId;
    this.#last = null;
    this.#gestureList.length = 0;
  }

  /**
   * @param {number} [pointerId]
   */
  release(pointerId) {
    if (pointerId !== undefined && (pointerId !== this.#pointerId || this.#pointerId < 0)) {
      return;
    }
    if (pointerId !== undefined) {
      if (this.#gestureList.length === 0) {
        this.#et.dispatchEvent(new CustomEvent('action', { detail: { input: 'tap' } }));
      } else {
        this.#et.dispatchEvent(new CustomEvent('action', { detail: { input: this.#gestureList.join('') } }));
      }
    }
    this.#pointerId = -1;
  }
}
