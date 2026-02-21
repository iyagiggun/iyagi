import { Subject } from 'rxjs';
import global from '../global/index.js';

const DEFAULT_RATE = 50;

/**
 * @type { number | null }
 */
let touchId = null;

/**
 * @type { number | null }
 */
let activatedAt = null;

/**
 * @type { number | null }
 */
let intervalId = null;

/**
 * @type { import('@iyagi/commons/coords').XY | null }
 */
let start = null;

const delta = { x: 0, y: 0 };

/**
 * @type { Subject<import('@iyagi/commons/coords').XY> }
 */
const move$ = new Subject();
/**
 * @type { Subject<void> }
 */
const tap$ = new Subject();

/**
 * @param {number} x
 */
const isIn = (x) => {
  return x < window.innerWidth / 2;
};

const checkMoveThreshold = () => {
  if (activatedAt === null) {
    throw new Error('[icontroller.joystick] Fail to detect tap. activatedAt is null');
  }
  return Math.abs(delta.x) > 5 || Math.abs(delta.y) > 5;
};

/**
 * @param {TouchEvent} evt
 */
const touchStart = (evt) => {
  evt.preventDefault();
  if (touchId !== null || global.messenger.isTalking) {
    return;
  }
  const touch = Array.from(evt.touches).find((t) => isIn(t.clientX));
  if (!touch) {
    return;
  }
  activatedAt = performance.now();
  start = {
    x: touch.clientX,
    y: touch.clientY,
  };
  touchId = touch.identifier;
  intervalId = window.setInterval(() => {
    if (!checkMoveThreshold()) {
      return;
    }
    move$.next(delta);
  }, DEFAULT_RATE);
  window.addEventListener('touchmove', touchMove, { passive: false });
  window.addEventListener('touchend', touchEnd, { passive: false });

};

/**
 * @param {TouchEvent} evt
 */
const touchMove = (evt) => {
  evt.preventDefault();
  if (touchId === null) {
    return;
  }

  const touch = Array.from(evt.touches).find((t) => t.identifier === touchId);
  if (!touch) {
    return;
  }

  if (!start) {
    throw new Error('Fail to joystick touchmove. start is null');
  }

  delta.x = touch.clientX - start.x;
  delta.y = touch.clientY - start.y;
};

/**
 * @param {TouchEvent} evt
 */
const touchEnd = (evt) => {
  evt.preventDefault();
  if (touchId === null || Array.from(evt.touches).some((t) => t.identifier === touchId)) {
    return;
  }
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
  window.removeEventListener('touchmove', touchMove);
  window.removeEventListener('touchend', touchEnd);

  if (!checkMoveThreshold()) {
    tap$.next();
  }

  touchId = null;
  intervalId = null;
  delta.x = 0;
  delta.y = 0;
  activatedAt = null;
};

export const joystick = {
  init: () => {
    window.addEventListener('touchstart', touchStart, { passive: false });
  },
  move$: move$.asObservable(),
  tap$: tap$.asObservable(),
};
