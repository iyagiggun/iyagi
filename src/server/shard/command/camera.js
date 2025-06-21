import { ServerObject } from '../../object/index.js';

export class ServerCameraCommandBuilder {
  #command;
  #list;

  /**
   *
   * @param {import('./index.js').ServerCommand} command
   * @param {import('../../const/index.js').ServerMessage[]} list
   */
  constructor(command, list) {
    this.#command = command;
    this.#list = list;
  }

  /**
   * @param {ServerObject | import('../../../coords/index.js').XY} target
   * @param {Object} [options={}]
   * @param {1|2|3} [options.speed]
   */
  focus(target, options) {
    const xy = target instanceof ServerObject ? target.center() : target;
    this.#list.push({
      type: 'camera.focus',
      data: {
        ...xy,
        ...options,
      },
    });
    return this.#command;
  }
}
