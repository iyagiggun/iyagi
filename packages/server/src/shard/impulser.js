/**
 * @typedef {Object} BehaviorPayload
 * @property {import('../object/index.js').ServerObject} actor
 * @property {import('../object/index.js').ServerObject[]} objects
 */

export class Impulser {

  /** @type {number | null} */
  #intervalId = null;

  /**
   * @type {import('../object/index.js').ServerObject[]}
   */
  targets = [];

  /**
   * @param {Object} [options]
   * @param {import('../object/index.js').ServerObject[]} [options.targets=[]]
  */
  constructor({ targets = [] } = {}) {
    this.targets = targets;
  }

  /**
   * @param {number} interval
   * @param {import('../const/index.js').ServerPayload} payload
   */
  activate(interval, payload) {
    this.#intervalId = setInterval(() => {
      this.targets.forEach((target) => {
        target.impulse$.next(payload);
      });
    }, interval);
  }

  clear() {
    if (this.#intervalId !== null) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  }
}

