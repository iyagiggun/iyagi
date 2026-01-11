
export const Watcher = {
  /**
   * @param {{
   *  observer: import("../../index.js").ServerObjectType,
   *  targets: import("../../index.js").ServerObjectType[],
   * }} p
   */
  find({ observer, targets }) {
    const length = targets.length;
    if (length === 0) {
      throw new Error('No objects to watch');
    }

    if (length === 1) {
      return targets[0];
    }

    throw new Error('구현 필요 TODO :: ');
  },
};
