export type Area = { x: number, y: number, w: number, h: number; };
// export type Pos = [x: number, y: number];
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 *
 * @param x1
 * @param x2 must be greater than x1
 * @param y1
 * @param y2 must be greater than y1
 * @returns
 */
const is_overlap_in_1d = (x1: number, x2: number, y1: number, y2: number) => {
  if (x2 <= y1 || x1 >= y2) {
    return false;
  }
  return true;
};

export const isOverlap = (a1: Area, a2: Area) => is_overlap_in_1d(a1.x, a1.x + a1.w, a2.x, a2.x + a2.w)
        && is_overlap_in_1d(a1.y, a1.y + a1.h, a2.y, a2.y + a2.h);

export const getDirectionByDelta = (delta_x: number, delta_y: number) => {
  if (Math.abs(delta_x) > Math.abs(delta_y)) {
    return delta_x > 0 ? 'right' : 'left';
  }
  return delta_y > 0 ? 'down' : 'up';
};