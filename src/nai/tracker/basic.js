import { findShortestPos, getCoordinateRelationship } from '../../utils/coordinates';

const intervalMap = new WeakMap();

export const IBasicTracker = {
  /**
   * @param {Object} p
   * @param {import('../../scene').IScene} p.scene
   * @param {import('../../object/character').ICharacter} p.controlled
   * @param {import('../../object/character').ICharacter} p.target
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
    let lastPos = controlled.position();
    /** @type {import('../../object/').Direction} */
    let directionWhenArrived = 'down';

    const interval = (() => window.setInterval(() => {
      const currentPos = controlled.position();
      const { distance } = getCoordinateRelationship(controlled, target);
      if (distance < 10) {
        controlled.stop();
        isMoving = false;
        lastPos = currentPos;
        controlled.directTo(directionWhenArrived);
        onArrived?.();
        return;
      }

      if (!isMoving || (lastPos.x === currentPos.x && lastPos.y === currentPos.y)) {
        controlled.stop();
        const dest = findShortestPos(controlled, target);
        directionWhenArrived = dest.direction;
        controlled.move(dest).then(() => {
          isMoving = false;
        });
        isMoving = true;
      }
      lastPos = currentPos;
    }, delay))();

    intervalMap.set(controlled, interval);
  },
  /**
   * @param {import('../../object/character').ICharacter} target
   */
  release: (target) => {
    const interval = intervalMap.get(target);
    window.clearInterval(interval);
  },
};
