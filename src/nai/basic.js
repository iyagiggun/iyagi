const intervalMap = new WeakMap();

const IBasicNAI = {
  /**
   * @param {Object} p
   * @param {import('../scene/type').ISceneCreated} p.scene
   * @param {import('../object/character/type').ICharacterCreated} p.controlled
   * @param {import('../object/character/type').ICharacterCreated} p.target
   * @param {number} [p.intervalDelay = 250];
   */
  control: ({
    scene,
    controlled,
    target,
    intervalDelay,
  }) => {
    const delay = intervalDelay > 0 ? intervalDelay : 250;
    const interval = (() => window.setInterval(() => {
      console.debug('scene', scene.name);
      console.debug('controlled', controlled.name);
      console.debug('target', target.name);
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
