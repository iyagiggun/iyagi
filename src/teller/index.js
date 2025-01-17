import { IMT } from '../const/message.js';

export class ServerTeller {
  /**
   * @param {function(*): void} send
   */
  constructor(send) {
    this.send = send;
  }

  /**
   * @param {Object} p
   * @param {string} p.target
   * @param {string | string[]} p.message
   * @returns
   */
  talk({
    target,
    message,
  }) {
    this.send( {
      type: IMT.SCENE_TALK,
      data: {
        target,
        message,
      },
    });
  }
}

