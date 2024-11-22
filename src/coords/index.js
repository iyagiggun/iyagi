/**
 * @typedef {Object} Area
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 */

/**
 * @typedef {Object} Position
 * @property {number} x
 * @property {number} y
 * @property {number=} z
 */

/**
 * @typedef {import('../object/index.js').default} SObject
 */


/**
 * @param {Area} areaA
 * @param {Area} areaB
 * @returns
 */
function isOverlap(areaA, areaB) {
  // console.error(areaA, areaB);
  return !(areaA.x + areaA.w <= areaB.x ||
           areaA.x >= areaB.x + areaB.w ||
           areaA.y + areaA.h <= areaB.y ||
           areaA.y >= areaB.y + areaB.h);
}

/**
 * @param {{
*  target: SObject;
*  objects: SObject[];
*  destination: Position;
* }} p
*/
export const getNextPosition = ({
  target,
  objects,
  destination,
}) => {
  const { x: curX, y: curY  } = target.position;
  const curZ = target.position.z ?? 1;
  const hitbox = target.hitbox;

  if (!hitbox) {
    return { ...destination, z: destination.z ?? curZ };
  }

  let deltaX = destination.x - curX;
  let deltaY = destination.y - curY;

  const interval_length = Math.max(Math.abs(deltaX), Math.abs(deltaY));
  const intervalX = deltaX / interval_length;
  const intervalY = deltaY / interval_length;

  const canHit = objects.filter((o) => o.name !== target.name && (o.position.z ?? 1) === curZ && o.hitbox);


  let step = 0;
  while (step < interval_length) {
    step++;
    const hitboxInStep = {
      ...hitbox,
      x: hitbox.x + curX + Math.round(intervalX * step),
      y: hitbox.y + curY + Math.round(intervalY * step),
    };

    const hit = canHit.find((o) => {
      if (!o.hitbox) {
        return;
      }
      const { x: oX, y: oY } = o.position;
      return isOverlap(hitboxInStep, {
        ...o.hitbox,
        x: o.hitbox.x + oX,
        y: o.hitbox.y + oY,
      });
    });
    if (hit) {
      return {
        x: curX + Math.round(intervalX * (step - 1)),
        y: curY + Math.round(intervalY * (step - 1)),
        z: destination.z ?? curZ,
      };
    }
  }
  return { ...destination, z: destination.z ?? curZ };
};
