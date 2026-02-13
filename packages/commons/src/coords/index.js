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
 * @typedef {XYZ & CircleShape} CircleArea
 * @typedef {XYZ & RectShape} RectArea
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
 * @returns {number} 0 (no overlap) ~ 1 (fully overlapping)
 */
export function getOverlapRatio(areaA, areaB) {
  if (areaA.z !== areaB.z) return 0;

  const isCircle = (/** @type {Area} */ a) => 'radius' in a;

  if (isCircle(areaA) && isCircle(areaB)) {
    const a = /** @type {CircleArea} */ (areaA);
    const b = /** @type {CircleArea} */ (areaB);
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distSq = dx ** 2 + dy ** 2;
    const maxDistSq = (a.radius + b.radius) ** 2;
    if (distSq > maxDistSq) return 0;
    return 1 - distSq / maxDistSq;
  }

  if (!isCircle(areaA) && !isCircle(areaB)) {
    const a = /** @type {RectArea} */ (areaA);
    const b = /** @type {RectArea} */ (areaB);
    const sumW = a.halfW + b.halfW;
    const sumH = a.halfH + b.halfH;
    const overlapX = sumW - Math.abs(a.x - b.x);
    const overlapY = sumH - Math.abs(a.y - b.y);
    if (overlapX <= 0 || overlapY <= 0) return 0;
    return Math.min(overlapX / sumW, overlapY / sumH);
  }

  // circle vs rect
  const circle = /** @type {CircleArea} */ (isCircle(areaA) ? areaA : areaB);
  const rect = /** @type {RectArea} */ (isCircle(areaA) ? areaB : areaA);

  const closestX = Math.max(rect.x - rect.halfW, Math.min(circle.x, rect.x + rect.halfW));
  const closestY = Math.max(rect.y - rect.halfH, Math.min(circle.y, rect.y + rect.halfH));

  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distSq = dx ** 2 + dy ** 2;
  const radiusSq = circle.radius ** 2;
  if (distSq > radiusSq) return 0;
  return 1 - distSq / radiusSq;
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

export * from './sweep.js';
