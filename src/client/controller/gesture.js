import { throttle } from 'lodash-es';

const GESTURE_THRESHOLD = 30;

export default class Gesture {

  #container;

  #et;

  #pointerId = -1;

  /** @type {('→' | '←' | '↑' | '↓')[]} */
  #gestureList = [];

  /**
   * @type {XY | null}
   */
  #last = null;

  #onTouchMove = throttle((evt) => {
    const { x, y } = evt.global;
    this.#check({ x, y });
  }, 50);

  /**
   *
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
  }

  /**
   * @param {number} x
   */
  isIn(x) {
    return x > window.innerWidth / 2;
  }

  /**
 * @param {XY} cur
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
    this.#container.addEventListener('touchmove', this.#onTouchMove);
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
        this.#et.dispatchEvent(new CustomEvent('action', { detail: { gesture: 'tap' } }));
      } else {
        this.#et.dispatchEvent(new CustomEvent('action', { detail: { gesture: this.#gestureList.join('') } }));
      }
    }
    this.#container.removeEventListener('touchmove', this.#onTouchMove);
    this.#pointerId = -1;
  }
}
