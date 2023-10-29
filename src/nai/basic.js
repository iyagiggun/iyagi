import { getDistance } from '../utils/coordinates';

const intervalMap = new WeakMap();

/**
 *
 * @param {import('../object/character/type').ICharacterCreated} attacker
 * @param {import('../object/character/type').ICharacterCreated} target
 */
const findShortestPos = (attacker, target) => {
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
 * @param {import('../object/type').IObjectCreated} self
 * @param {import('../object/type').IObjectCreated} target
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
  // x 축으로 겹쳐 있다면 sin 으로 구해야 함.
  if (xDiff < halfWidth + tHalfWidth) {
    const arcSin = Math.abs(cDistance / yDiff);
    const distance = cDistance - arcSin * halfHeight - arcSin * tHalfHeight;
    return {
      distance, xDiff, yDiff,
    };
  }
  // y축으로 겹쳐있거나 나머지의 경우는 cos 으로 구함.
  const arcCos = Math.abs(cDistance / xDiff);
  const distance = cDistance - arcCos * halfWidth - arcCos * tHalfWidth;
  return {
    distance, xDiff, yDiff,
  };
};

const IBasicNAI = {
  /**
   * @param {Object} p
   * @param {import('../scene/type').ISceneCreated} p.scene
   * @param {import('../object/character/type').ICharacterCreated} p.controlled
   * @param {import('../object/character/type').ICharacterCreated} p.target
   * @param {number} [p.intervalDelay = 250]
   */
  control: ({
    scene,
    controlled,
    target,
    intervalDelay,
  }) => {
    let isActing = false;
    // @ts-ignore
    const delay = intervalDelay > 0 ? intervalDelay : 250;
    const interval = (() => window.setInterval(() => {
      if (isActing) {
        return;
      }
      isActing = true;

      const { distance } = getCoordinateRelationship(controlled, target);
      if (distance < 10) {
        // onArrived?.();
        console.debug('arrived');
        isActing = false;
        return;
      }

      const dest = findShortestPos(controlled, target);
      scene.moveObject(controlled, dest).then(() => {
        isActing = false;
      });
    }, delay))();

    intervalMap.set(controlled, interval);
  },
  /**
   * @param {import('../object/character/type').ICharacterCreated} target
   */
  release: (target) => {
    const interval = intervalMap.get(target);
    window.clearInterval(interval);
  },

};

export default IBasicNAI;
