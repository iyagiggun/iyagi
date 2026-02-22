
export const Watcher = {
  /**
   * @param {{
   *  observer: import("../../index.js").ObjType,
   *  targets: import("../../index.js").ObjType[],
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
