import { findShortestPos, getCoordinateRelationship } from '../../utils/coordinates';

const intervalMap = new WeakMap();

export const IBasicTracker = {
  /**
   * @param {Object} p
   * @param {import('../../scene/type').ISceneCreated} p.scene
   * @param {import('../../object/character/type').ICharacterCreated} p.controlled
   * @param {import('../../object/character/type').ICharacterCreated} p.target
   * @param {number} [p.intervalDelay = 250]
   */
  control: ({
    scene,
    controlled,
    target,
    intervalDelay,
  }) => {
    // @ts-ignore
    const delay = intervalDelay > 0 ? intervalDelay : 250;

    let isActing = false;

    const interval = (() => window.setInterval(() => {
      const { distance } = getCoordinateRelationship(controlled, target);
      if (distance < 10) {
        scene.stopObject(controlled);
        // onArrived?.();
        return;
      }

      if (isActing) {
        return;
      }

      isActing = true;
      const dest = findShortestPos(controlled, target);
      scene.moveObject(controlled, dest).then(() => {
        isActing = false;
      });
    }, delay))();

    intervalMap.set(controlled, interval);
  },
  /**
   * @param {import('../../object/character/type').ICharacterCreated} target
   */
  release: (target) => {
    const interval = intervalMap.get(target);
    window.clearInterval(interval);
  },

};
