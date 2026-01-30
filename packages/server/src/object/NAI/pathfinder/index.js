export const Pathfinder = {
  /**
   * @param {{
   *  finder: import("../../index.js").ServerObjectType,
   *  dest: import("@iyagi/commons/coords").XY
   *  objects?: import("../../index.js").ServerObjectType[],
   *  size: number,
   * }} p
   */
  findNextStep({ finder, dest, size }) {
    const center = finder.xyz;

    const distance = Math.hypot(dest.x - center.x, dest.y - center.y);
    return distance <= size
      ? dest
      : {
        x: center.x + ((dest.x - center.x) / distance) * size,
        y: center.y + ((dest.y - center.y) / distance) * size,
      };
  },
};
