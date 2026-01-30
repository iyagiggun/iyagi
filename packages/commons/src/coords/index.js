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
 * @param {number} angle
 */
export function getDirectionByAngle(angle) {
  const normalizedAngle = (angle % 360 + 360) % 360;
  if (normalizedAngle < 45 || normalizedAngle >= 315) {
    return 'right';
  }
  if (normalizedAngle >= 45 && normalizedAngle < 135) {
    return 'down';
  }
  if (normalizedAngle >= 135 && normalizedAngle < 225) {
    return 'left';
  }
  return 'up';
}
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
    return dx * dx + dy * dy <= effectiveRadius * effectiveRadius;
  } else {
    // Rectangle - threshold 비율 영역 체크
    return Math.abs(point.x - center.x) <= shape.halfW * threshold &&
           Math.abs(point.y - center.y) <= shape.halfH * threshold;
  }
}

export * from './sweep.js';
