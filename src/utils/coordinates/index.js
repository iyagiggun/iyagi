/**
 * @param {number} x1
 * @param {number} x2 must be greater than x1
 * @param {number} y1
 * @param {number} y2 must be greater than y1
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
 */
export const isOverlap = (a1, a2) => isOverlapIn1D(a1.x, a1.x + a1.w, a2.x, a2.x + a2.w)
        && isOverlapIn1D(a1.y, a1.y + a1.h, a2.y, a2.y + a2.h);

/**
 * @param {number} deltaX
 * @param {number} deltaY
 */
export const getDirectionByDelta = (deltaX, deltaY) => {
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? 'right' : 'left';
  }
  return deltaY > 0 ? 'down' : 'up';
};

/**
 * @param {import('./type').Position} p1
 * @param {import('./type').Position} p2
 */
export const getDistance = (p1, p2) => Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p2.y) ** 2);

/**
 *
 * @param {import('../../object/character/type').ICharacterCreated} attacker
 * @param {import('../../object/character/type').ICharacterCreated} target
 */
export const findShortestPos = (attacker, target) => {
  const attackerPos = attacker.getPosition();
  const { x: tCX, y: tCY } = target.getPosition();
  const tWidth = target.getWidth();
  const tHeight = target.getHeight();

  // 공격 위치 후보군
  const posList = [
    // 타겟의 위
    {
      x: tCX,
      y: tCY + tHeight,
    },
    // 타겟의 아래
    {
      x: tCX,
      y: tCY - tHeight,
    },
    // 타겟의 오른쪽
    {
      x: tCX + tWidth,
      y: tCY,
    },
    // 타겟의 왼쪽
    {
      x: tCX - tWidth,
      y: tCY,
    },
  ];

  const distanceList = posList.map((pos) => getDistance(attackerPos, pos));
  const minDistance = Math.min(...distanceList);
  const shortestPosIdx = distanceList.findIndex((distance) => distance === minDistance);

  return posList[shortestPosIdx];
};

/**
 * @param {import('../../object/type').IObjectCreated} self
 * @param {import('../../object/type').IObjectCreated} target
 */
export const getCoordinateRelationship = (self, target) => {
  const { x, y } = self.getCenterPosition();
  const halfWidth = self.getWidth() / 2;
  const halfHeight = self.getHeight() / 2;
  const { x: tx, y: ty } = target.getCenterPosition();
  const tHalfWidth = target.getWidth() / 2;
  const tHalfHeight = target.getHeight() / 2;

  const xDiff = tx - x;
  const yDiff = ty - y;

  // y 축이 동일하면 삼각함수 못씀
  if (xDiff === 0) {
    const distance = Math.abs(yDiff - halfHeight - tHalfHeight);
    return {
      distance, xDiff, yDiff,
    };
  }
  // x 축이 동일하면 삼각함수 못씀
  if (yDiff === 0) {
    const distance = Math.abs(xDiff - halfWidth - tHalfWidth);
    return {
      distance, xDiff, yDiff,
    };
  }

  // 중심점 간 거리
  const cDistance = Math.sqrt(xDiff ** 2 + yDiff ** 2);

  const dTan = Math.abs(yDiff / xDiff);
  const sTan = halfHeight / halfWidth;
  const tTan = tHalfHeight / tHalfWidth;

  const arcSin = Math.abs(cDistance / yDiff);
  const arcCos = Math.abs(cDistance / xDiff);

  const sInnerDistance = dTan > sTan ? arcSin * halfHeight : arcCos * halfWidth;
  const tInnerDistance = dTan > tTan ? arcSin * tHalfHeight : arcCos * tHalfWidth;

  const distance = cDistance - sInnerDistance - tInnerDistance;

  return {
    distance,
    xDiff,
    yDiff,
  };
};
