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
   * @param {string | string[]} p.text
   * @returns
   */
  talk({
    target,
    text,
  }) {
    this.send( {
      type: IMT.SCENE_TALK,
      data: {
        target,
        text,
      },
    });
  }
}

