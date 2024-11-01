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
  const { x: curX, y: curY, z: curZ } = target.position;
  const hitboxes = (target.hitboxes ?? []);

  if (hitboxes.length === 0) {
    return { ...destination, z: destination.z ?? curZ };
  }

  let deltaX = destination.x - curX;
  let deltaY = destination.y - curY;

  const interval_length = Math.max(Math.abs(deltaX), Math.abs(deltaY));
  const intervalX = deltaX / interval_length;
  const intervalY = deltaY / interval_length;

  const canHit = objects.filter((o) => o.name !== target.name && o.position.z === curZ && o.hitboxes);


  let step = 0;
  while (step < interval_length) {
    step++;
    const hitboxesInStep = hitboxes.map((org) => ({
      ...org,
      x: org.x + curX + Math.round(intervalX * step),
      y: org.y + curY + Math.round(intervalY * step),
    }));

    const hit = canHit.find((o) => {
      const { x: oX, y: oY } = o.position;
      return hitboxesInStep.some((hitboxes) => o.hitboxes.some((o_hitboxes) => isOverlap(hitboxes, {
        ...o_hitboxes,
        x: o_hitboxes.x + oX,
        y: o_hitboxes.y + oY,
      })));
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
