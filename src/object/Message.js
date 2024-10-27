import { IMT } from '../const/message.js';

export default class ServerObjectMessage {
  #name;

  /**
   * @param {string} name
   */
  constructor(name) {
    this.#name = name;
  }

  /**
   * @param {import('../coords/index.js').Position} position
   * @returns
   */
  move(position) {
    return {
      type: IMT.MOVE,
      data: {
        target: this.#name,
        position,
      },
    };
  }
}
