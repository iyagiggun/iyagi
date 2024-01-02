import { findShortestPos, getCoordinateRelationship } from '../../utils/coordinates';

const intervalMap = new WeakMap();

export const IBasicTracker = {
  /**
   * @param {Object} p
   * @param {import('../../scene').default} p.scene
   * @param {import('../../object/').ICharacter} p.controlled
   * @param {import('../../object/').ICharacter} p.target
   * @param {() => void} [p.onArrived]
   * @param {number} [p.intervalDelay = 250]
   */
  control: ({
    scene,
    controlled,
    target,
    onArrived,
    intervalDelay,
  }) => {
    // @ts-ignore
    const delay = intervalDelay > 0 ? intervalDelay : 500;

    let isMoving = false;
    let lastPos = controlled.getPosition();
    let directionWhenArrived = 'down';

    const interval = (() => window.setInterval(() => {
      const currentPos = controlled.getPosition();
      const { distance } = getCoordinateRelationship(controlled, target);
      if (distance < 10) {
        scene.stopObject(controlled);
        isMoving = false;
        lastPos = currentPos;
        controlled.changeDirection(directionWhenArrived);
        onArrived?.();
        return;
      }

      if (!isMoving || (lastPos.x === currentPos.x && lastPos.y === currentPos.y)) {
        scene.stopObject(controlled);

        const dest = findShortestPos(controlled, target);
        directionWhenArrived = dest.direction;
        scene.moveObject(controlled, dest).then(() => {
          isMoving = false;
        });
        isMoving = true;
      }
      lastPos = currentPos;
    }, delay))();

    intervalMap.set(controlled, interval);
  },
  /**
   * @param {import('../../object/').ICharacter} target
   */
  release: (target) => {
    const interval = intervalMap.get(target);
    window.clearInterval(interval);
  },

};
