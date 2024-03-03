import { TouchEvent } from '../../event/touch';

class IObjectEvent extends TouchEvent {
  #object;

  /**
   * @param {import('..').IObject} object
   */
  constructor(object) {
    super(object.container);
    this.#object = object;
  }
}

export { IObjectEvent };
