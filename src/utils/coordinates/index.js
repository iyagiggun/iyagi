/**
 * @typedef {Object} Position
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} Area
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 */

/**
 *
 * @param {Position} pos
 * @param {Area} area
 * @returns
 */
export const isPosInArea = (pos, area) => {
  const withinX = pos.x >= area.x && pos.x <= (area.x + area.w);
  const withinY = pos.y >= area.y && pos.y <= (area.y + area.h);
  return withinX && withinY;
};

/**
 * @param {Area} a1
 * @param {Area} a2
 */
export const getOverlappingArea = (a1, a2) => {
  const x1 = a1.x;
  const y1 = a1.y;
  const w1 = a1.w;
  const h1 = a1.h;

  const x2 = a2.x;
  const y2 = a2.y;
  const w2 = a2.w;
  const h2 = a2.h;

  // 겹치는 영역의 좌표 계산
  const xOverlap = Math.max(0, Math.min(x1 + w1, x2 + w2) - Math.max(x1, x2));
  const yOverlap = Math.max(0, Math.min(y1 + h1, y2 + h2) - Math.max(y1, y2));

  // 겹치는 영역이 있는지 확인
  if (xOverlap > 0 && yOverlap > 0) {
    // 겹치는 영역의 좌표와 크기 계산
    const xOverlapCoord = Math.max(x1, x2);
    const yOverlapCoord = Math.max(y1, y2);
    const overlapWidth = Math.min(x1 + w1, x2 + w2) - xOverlapCoord;
    const overlapHeight = Math.min(y1 + h1, y2 + h2) - yOverlapCoord;

    // 겹치는 영역 객체 반환
    return {
      x: xOverlapCoord, y: yOverlapCoord, w: overlapWidth, h: overlapHeight,
    };
  }
  // 겹치는 영역이 없을 경우 null 반환
  return null;
};

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
 * @param {Position} p1
 * @param {Position} p2
 */
export const getDistance = (p1, p2) => Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p2.y) ** 2);

/**
 *
 * @param {import('../../object/character').ICharacterCreated} attacker
 * @param {import('../../object/character').ICharacterCreated} target
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
      direction: 'down',
      x: tCX,
      y: tCY + tHeight,
    },
    // 타겟의 아래
    {
      direction: 'up',
      x: tCX,
      y: tCY - tHeight,
    },
    // 타겟의 오른쪽
    {
      direction: 'left',
      x: tCX + tWidth,
      y: tCY,
    },
    // 타겟의 왼쪽
    {
      direction: 'right',
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
 * @param {import('../../object').IObject} self
 * @param {import('../../object').IObject} target
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
