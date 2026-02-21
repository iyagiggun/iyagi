import { Subject } from 'rxjs';

/**
 * @typedef {('→' | '←' | '↑' | '↓')} Gesture
 */

const GESTURE_THRESHOLD = 12;

/**
 * @type { number | null }
 */
let touchId = null;

/**
 * @type { Gesture[] }
 */
let gestures = [];

/**
 * @type { import('@iyagi/commons/coords').XY | null }
 */
let last = null;

/**
 * @type { Subject<void> }
 */
const tap$ = new Subject();
/**
 * @type { Subject<string> }
 */
const gesture$ = new Subject();

/**
 * @param {number} x
 */
const isIn = (x) => {
  return x > window.innerWidth / 2;
};

/**
 * @param {TouchEvent} evt
 */
const touchStart = (evt) => {
  evt.preventDefault();
  if (touchId !== null) {
    return;
  }
  const touch = Array.from(evt.touches).find((t) => isIn(t.clientX));
  if (!touch) {
    return;
  }
  touchId = touch.identifier;
  last = null;
  gestures = [];
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

  const cur = {
    x: touch.clientX,
    y: touch.clientY,
  };

  if (!last) {
    last = cur;
    return;
  }

  const deltaX = cur.x - last.x;
  const absDeltaX = Math.abs(deltaX);
  const deltaY = cur.y - last.y;
  const absDeltaY = Math.abs(deltaY);

  if (absDeltaX < GESTURE_THRESHOLD && absDeltaY < GESTURE_THRESHOLD) {
    return;
  }

  if (absDeltaX > absDeltaY) {
    const dir = deltaX > 0 ? '→' : '←';
    if (gestures.length === 0 || gestures[gestures.length - 1] !== dir) {
      gestures.push(dir);
    }
  } else {
    const dir = deltaY > 0 ? '↓' : '↑';
    if (gestures.length === 0 || gestures[gestures.length - 1] !== dir) {
      gestures.push(dir);
    }
  }
  last = cur;
};

/**
 * @param {TouchEvent} evt
 */
const touchEnd = (evt) => {
  evt.preventDefault();
  if (touchId === null || Array.from(evt.touches).some((t) => t.identifier === touchId)) {
    return;
  }
  window.removeEventListener('touchmove', touchMove);
  window.removeEventListener('touchend', touchEnd);

  if (gestures.length === 0) {
    tap$.next();
  } else {
    gesture$.next(gestures.join(''));
  }

  touchId = null;
};

export const pad = {
  init: () => {
    window.addEventListener('touchstart', touchStart, { passive: false });
  },
  tap$: tap$.asObservable(),
  gesture$: gesture$.asObservable(),
};
