import { IMT } from '../const/message';

export default class ServerObjectMessage {
  #name;

  /**
   * @param {string} name
   */
  constructor(name) {
    this.#name = name;
  }

  /**
   * @param {Position} position
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
