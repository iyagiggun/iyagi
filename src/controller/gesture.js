import { throttle } from 'lodash-es';

/**
 * @typedef Info
 * @property {import('pixi.js').DisplayObject} layer
 * @property {number} pointerId
 * @property {import('../object/character').ICharacter} player
 * @property {import('events')} eventEmitter
 */

const GESTURE_THRESHOLD = 50;

/** @type {Info | null} */
let info = null;

/** @type {('→' | '←' | '↑' | '↓')[]} */
const gestureList = [];

/** @type { import('../utils/coordinates').Position | null} */
let lastPosition = null;

/**
 * @param {import('../utils/coordinates').Position} cur
 */
const check = (cur) => {
  if (!lastPosition) {
    lastPosition = cur;
    return;
  }
  const xDelta = cur.x - lastPosition.x;
  const xDeltaAbs = Math.abs(xDelta);
  const yDelta = cur.y - lastPosition.y;
  const yDeltaAbs = Math.abs(yDelta);

  if (xDeltaAbs > yDeltaAbs && xDeltaAbs > GESTURE_THRESHOLD) {
    const dir = xDelta > 0 ? '→' : '←';
    if (gestureList.length === 0 || gestureList[gestureList.length - 1] !== dir) {
      gestureList.push(dir);
      info?.eventEmitter.emit(gestureList.join(''));
    }
    lastPosition = cur;
    return;
  }
  if (yDeltaAbs > xDeltaAbs && yDeltaAbs > GESTURE_THRESHOLD) {
    const dir = yDelta > 0 ? '↓' : '↑';
    if (gestureList.length === 0 || gestureList[gestureList.length - 1] !== dir) {
      gestureList.push(dir);
      info?.eventEmitter.emit(gestureList.join(''));
    }
    lastPosition = cur;
  }
};

const onTouchMove = throttle((evt) => {
  const { x, y } = evt.global;
  check({ x, y });
}, 50);

const GestureDetector = {
  /**
   * @param {Info} _info
   */
  activate(_info) {
    info = _info;
    info.layer.addEventListener('touchmove', onTouchMove);
    lastPosition = null;
    gestureList.length = 0;
  },
  /**
   * @param {number} pointerId
   */
  release: (pointerId) => {
    if (!info || pointerId !== info.pointerId) {
      return;
    }
    if (gestureList.length === 0) {
      info.eventEmitter.emit('tap');
    }
    info.layer.removeEventListener('touchmove', onTouchMove);
    info = null;
  },
};

export { GestureDetector };
