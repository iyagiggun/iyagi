/**
 * @param {number} x1
 * @param {number} x2 must be greater than x1
 * @param {number} y1
 * @param {number} y2 must be greater than y1
 * @returns
 */
const isOverlapIn1D = (x1, x2, y1, y2) => {
  if (x2 <= y1 || x1 >= y2) {
    return false;
  }
  return true;
};

/**
 * @param {import('./type').Area} a1
 * @param {import('./type').Area} a2
 * @returns
 */
export const isOverlap = (a1, a2) => isOverlapIn1D(a1.x, a1.x + a1.w, a2.x, a2.x + a2.w)
        && isOverlapIn1D(a1.y, a1.y + a1.h, a2.y, a2.y + a2.h);

/**
 * @param {number} deltaX
 * @param {number} deltaY
 * @returns
 */
export const getDirectionByDelta = (deltaX, deltaY) => {
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? 'right' : 'left';
  }
  return deltaY > 0 ? 'down' : 'up';
};
