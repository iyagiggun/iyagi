/**
 * @typedef {{ id: string }} EffectTarget
 */

export class ServerEffectCommandBuilder {
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
   * @param {EffectTarget | EffectTarget[]} target
   * @param {*} [options]
   */
  fadeIn(target, options) {
    this.#list.push({
      type: 'effect.fade.in',
      data: {
        target: (Array.isArray(target) ? target : [target]).map((t) => t.id),
        ...options,
      },
    });
    return this.#command;
  }

  /**
   * @param {EffectTarget | EffectTarget[]} target
   * @param {*} [options]
   */
  fadeOut(target, options) {
    this.#list.push({
      type: 'effect.fade.out',
      data: {
        target: (Array.isArray(target) ? target : [target]).map((t) => t.id),
        ...options,
      },
    });
    return this.#command;
  }
}
