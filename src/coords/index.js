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
 * @typedef {import('../object/index.js').IObject} IObject
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
 * @param {{
*  target: IObject;
*  objects: IObject[];
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

  if (!hitbox) {
    return { ...destination, z: destZ };
  }

  let deltaX = destination.x - curX;
  let deltaY = destination.y - curY;

  const interval_length = Math.max(Math.abs(deltaX), Math.abs(deltaY));
  const intervalX = deltaX / interval_length;
  const intervalY = deltaY / interval_length;

  const canHit = objects.filter((o) => o.serial !== target.serial && (o.z ?? 1) === curZ && o.hitbox);


  let step = 0;
  while (step < interval_length) {
    step++;
    const hitboxInStep = {
      ...hitbox,
      x: hitbox.x + Math.round(intervalX * step),
      y: hitbox.y + Math.round(intervalY * step),
    };

    const hit = canHit.find((o) => {
      const hitbox = o.hitbox;
      if (!hitbox) {
        return;
      }
      return isOverlap(hitboxInStep, hitbox);
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
