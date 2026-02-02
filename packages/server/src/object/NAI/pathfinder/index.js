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
  /**
   * @param {object} param0
   * @param {import("@iyagi/commons/coords").XY} param0.attacker
   * @param {import("@iyagi/commons/coords").XY} param0.target
   * @param {number} param0.distance
   * @return {import("@iyagi/commons/coords").XY}
   */
  findAttackPosition({ attacker, target, distance }) {
    const tx = target.x;
    const ty = target.y;
    const ax = attacker.x;
    const ay = attacker.y;
    // target 기준으로 현위치 + 4방향에 distance만큼 떨어진 위치
    const positions = [
      { x: tx, y: ty - distance },      // 위
      { x: tx, y: ty + distance },      // 아래
      { x: tx - distance, y: ty },      // 왼쪽
      { x: tx + distance, y: ty },      // 오른쪽
    ];
    console.log(positions);

    // attacker와 가장 가까운 위치 찾기
    let minDistance = Infinity;
    let closestPosition = positions[0];

    for (const pos of positions) {
      const dist = Math.hypot(pos.x - ax, pos.y - ay);
      if (dist < minDistance) {
        minDistance = dist;
        closestPosition = pos;
      }
    }

    return closestPosition;
  },

};
