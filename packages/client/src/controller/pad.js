import { filter, fromEvent, Subject, throttleTime } from 'rxjs';

/**
 * @typedef {('→' | '←' | '↑' | '↓')} Gesture
 */

const GESTURE_THRESHOLD = 12;

export default class Pad {

  #container;

  /** @type {number | null} */
  #pointerId = null;

  /** @type {Gesture[]} */
  #gestureList = [];

  /**
   * @type {import('@iyagi/commons/coords').XY | null}
   */
  #last = null;

  /** @type {Subject<string>} */
  gesture$ = new Subject();

  /** @type {Subject<void>} */
  tap$ = new Subject();

  /**
   * @param {{
   *  container: import('pixi.js').Container;
   * }} param0
   */
  constructor({
    container,
  }) {
    this.#container = container;

    /** @type {import('rxjs').Observable<import('pixi.js').FederatedPointerEvent>} */
    (fromEvent(this.#container, 'touchmove'))
      .pipe(
        filter(() => this.#pointerId !== -1),
        throttleTime(50)
      )
      .subscribe(
        ({ global }) => this.#check(global)
      );
  }

  /**
   * @param {number} x
   */
  isIn(x) {
    return x > window.innerWidth / 2;
  }

  /**
 * @param {import('@iyagi/commons/coords').XY} cur
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
      }
      this.#last = cur;
      return;
    }
    if (yDeltaAbs > xDeltaAbs && yDeltaAbs > GESTURE_THRESHOLD) {
      const dir = yDelta > 0 ? '↓' : '↑';
      if (this.#gestureList.length === 0 || this.#gestureList[this.#gestureList.length - 1] !== dir) {
        this.#gestureList.push(dir);
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
    if (pointerId !== undefined && (pointerId === null || pointerId !== this.#pointerId)) {
      return;
    }
    if (pointerId !== undefined) {
      if (this.#gestureList.length === 0) {
        this.tap$.next();
      } else {
        this.gesture$.next(this.#gestureList.join(''));
      }
    }
    this.#pointerId = null;;
  }
}
