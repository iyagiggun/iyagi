/**
 * @typedef {{
 *  x: number;
 *  y: number;
 * }} XY
 *
 * @typedef { XY & {
 *  z: number;
 * }} XYZ
 *
 * @typedef {{
 *  w: number;
 *  h: number;
 * }} WH
 *
 * @typedef { XY & WH } XYWH
 *
 * @typedef {'up' | 'down' | 'left' | 'right' } Direction
 */

export const Z_MAX = 999;
export const Z_LAYER = Z_MAX + 1;

/**
 * https://easings.net/#easeInOutSine
 * @param {number} t
 */
export function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * @param {XYWH} areaA
 * @param {XYWH} areaB
 * @returns
 */
export function isOverlap(areaA, areaB) {
  return !(areaA.x + areaA.w <= areaB.x ||
           areaA.x >= areaB.x + areaB.w ||
           areaA.y + areaA.h <= areaB.y ||
           areaA.y >= areaB.y + areaB.h);
}

/**
 * @param {XY} before
 * @param {XY} after
 */
export function getDirectionByDelta(before, after) {
  const deltaX = after.x - before.x;
  const deltaY = after.y - before.y;
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? 'right' : 'left';
  }
  return deltaY > 0 ? 'down' : 'up';
};

/**
 * @param {XY} point
 * @param {import('@iyagi/server/object/index.js').ServerObjectType} object
 * @param {number} [threshold=0.7] - shape 크기 대비 비율 (0~1)
 * @returns {boolean}
 */
export function isIn(point, object, threshold = 0.7) {
  const shape = object.shape;
  const center = object.xyz;
  if ('radius' in shape) {
    // Circle - threshold 비율 영역 체크
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const effectiveRadius = shape.radius * threshold;
    return dx ** 2 + dy ** 2 <= effectiveRadius ** 2;
  } else {
    // Rectangle - threshold 비율 영역 체크
    return Math.abs(point.x - center.x) <= shape.halfW * threshold &&
           Math.abs(point.y - center.y) <= shape.halfH * threshold;
  }
}


/**
 * @param {object} param0
 * @param {import("@iyagi/commons/coords").XY} param0.position
 * @param {import("@iyagi/commons/coords").Direction} param0.direction
 * @param {number} param0.distance
 * @return {import("@iyagi/commons/coords").XY}
 */
export const getPositionInDirection = ({
  position,
  direction,
  distance,
}) => {
  switch (direction) {
    case 'up': return {
      x: position.x,
      y: position.y - distance,
    };
    case 'down': return {
      x: position.x,
      y: position.y + distance,
    };
    case 'left': return {
      x: position.x - distance,
      y: position.y,
    };
    case 'right': return {
      x: position.x + distance,
      y: position.y,
    };
    default: throw new Error(`Unknown direction ${direction}`);
  }
};

export * from './sweep.js';
