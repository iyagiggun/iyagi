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
 *  x?: number;
 *  y?: number;
 *  z?: number;
 * }} OptionalXYZ
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

/**
 * @typedef {object} CircleShape
 * @property {number} radius
 */

/**
 * @typedef {object} RectShape
 * @property {number} halfW
 * @property {number} halfH
 */

/**
 * @typedef {CircleShape | RectShape} Shape
 */

/**
 * @typedef {object} CircleArea
 * @property {number} x
 * @property {number} y
 * @property {number} radius
 */

/**
 * @typedef {object} RectArea
 * @property {number} x
 * @property {number} y
 * @property {number} halfW
 * @property {number} halfH
 */

/**
 * @typedef {CircleArea | RectArea} Area
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
 * @param {Area} areaA
 * @param {Area} areaB
 * @returns {boolean}
 */
export function isOverlap(areaA, areaB) {
  const isCircle = (/** @type {Area} */ a) => 'radius' in a;

  if (isCircle(areaA) && isCircle(areaB)) {
    const a = /** @type {CircleArea} */ (areaA);
    const b = /** @type {CircleArea} */ (areaB);
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = a.radius + b.radius;
    return dx ** 2 + dy ** 2 <= dist ** 2;
  }

  if (!isCircle(areaA) && !isCircle(areaB)) {
    const a = /** @type {RectArea} */ (areaA);
    const b = /** @type {RectArea} */ (areaB);
    return Math.abs(a.x - b.x) <= a.halfW + b.halfW &&
      Math.abs(a.y - b.y) <= a.halfH + b.halfH;
  }

  // circle vs rect
  const circle = /** @type {CircleArea} */ (isCircle(areaA) ? areaA : areaB);
  const rect = /** @type {RectArea} */ (isCircle(areaA) ? areaB : areaA);

  const closestX = Math.max(rect.x - rect.halfW, Math.min(circle.x, rect.x + rect.halfW));
  const closestY = Math.max(rect.y - rect.halfH, Math.min(circle.y, rect.y + rect.halfH));

  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx ** 2 + dy ** 2 <= circle.radius ** 2;
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
 * @param {Area} area
 * @param {number} [threshold=1] - 영역 크기 대비 비율 (0~1)
 * @returns {boolean}
 */
export function isIn(point, area, threshold = 1) {
  if ('radius' in area) {
    const dx = point.x - area.x;
    const dy = point.y - area.y;
    const effectiveRadius = area.radius * threshold;
    return dx ** 2 + dy ** 2 <= effectiveRadius ** 2;
  } else {
    return Math.abs(point.x - area.x) <= area.halfW * threshold &&
      Math.abs(point.y - area.y) <= area.halfH * threshold;
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
