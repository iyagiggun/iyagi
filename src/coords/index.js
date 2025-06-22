/**
 * @typedef {Object} Area
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 */

/**
 * @typedef {{ x: number, y: number }} XY
 * @typedef { XY & { z: number }} XYZ
 */

/**
 * @typedef {'up' | 'down' | 'left' | 'right'} Direction
 */

/**
 * @param {Area} areaA
 * @param {Area} areaB
 * @returns
 */
export function isOverlap(areaA, areaB) {
  return !(areaA.x + areaA.w <= areaB.x ||
           areaA.x >= areaB.x + areaB.w ||
           areaA.y + areaA.h <= areaB.y ||
           areaA.y >= areaB.y + areaB.h);
}

/**
 * @param {XY} xy
 * @param {Area} area
 * @returns
 */
export function isIn(xy, area) {
  return xy.x >= area.x && xy.x <= area.x + area.w && xy.y >= area.y && xy.y <= area.y + area.h;
}

/**
 * @param {{
 *  target: import("../server/object/index.js").ServerObject;
 *  objects: import("../server/object/index.js").ServerObject[];
 *  destination: XY | XYZ;
 * }} p
 */
export const getNextXYZ = ({
  target,
  objects,
  destination,
}) => {
  const { x: curX, y: curY  } = target;
  const curZ = target.z;
  const destZ = 'z' in destination ? destination.z : curZ;
  const hitbox = target.hitbox;

  // if (!hitbox) {
  //   return { ...destination, z: destZ };
  // }

  let deltaX = destination.x - curX;
  let deltaY = destination.y - curY;

  const interval_length = Math.max(Math.abs(deltaX), Math.abs(deltaY));
  const intervalX = deltaX / interval_length;
  const intervalY = deltaY / interval_length;

  const canHit = objects.filter((o) => {
    if (o.id === target.id) {
      return false;
    }
    const oHitBox = o.hitbox;
    if (oHitBox.w === 0 || oHitBox.h === 0) {
      return false;
    }
    return o.z === curZ;
  });

  let step = 0;
  while (step < interval_length) {
    step++;
    const hitboxInStep = {
      ...hitbox,
      x: hitbox.x + Math.round(intervalX * step),
      y: hitbox.y + Math.round(intervalY * step),
    };

    const hit = canHit.find((o) => {
      return isOverlap(hitboxInStep, o.hitbox);
    });
    if (hit) {
      return {
        x: curX + Math.round(intervalX * (step - 1)),
        y: curY + Math.round(intervalY * (step - 1)),
        // is valid??
        z: destZ,
      };
    }
  }
  return { ...destination, z: destZ };
};

/**
 * @param {XY} before
 * @param {XY} after
 */
export const getDirectionByDelta = (before, after) => {
  const deltaX = after.x - before.x;
  const deltaY = after.y - before.y;
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? 'right' : 'left';
  }
  return deltaY > 0 ? 'down' : 'up';
};
