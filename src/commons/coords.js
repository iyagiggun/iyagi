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
 * @typedef { XY & WH } Area
 *
 * @typedef {'up' | 'down' | 'left' | 'right' } Direction
 */

/**
 * https://easings.net/#easeInOutSine
 * @param {number} t
 */
export function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
