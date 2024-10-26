import ServerObjectMessage from './Message';

export default class SObject {
  #name;

  #hitboxes;

  message;

  /**
   * @param {Object} p
   * @param {string} p.name
   * @param {Array.<Area>=} p.hitboxes
   */
  constructor({
    name,
    hitboxes = [],
  }) {
    this.#name = name;
    this.#hitboxes = hitboxes;

    this.message = new ServerObjectMessage(this.#name);
  }

}
