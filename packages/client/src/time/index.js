let offset = 0;

export const Time = {
  now: () => {
    return performance.now() + offset;
  },
  /**
   * @param {number} next
   */
  sync: (next) => {
    //TODO:: lerp
    offset = next - performance.now();
  },
};
