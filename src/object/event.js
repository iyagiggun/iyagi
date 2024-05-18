/**
 * @typedef {{ target: import('./index').IObject }} IObjectEventTapData
 */

class IObjectEventManager {
  #object;

  #bus = {
    tap: () => {
      this.#object.emit('tap', {});
    },
  };

  enable = false;

  /**
   * @param {import('./index').IObject} object
   */
  constructor(object) {
    this.#object = object;
  }

  activate() {
    if (this.enable) {
      return;
    }
    this.#object.container.eventMode = 'static';
    this.#object.container.on('tap', this.#bus.tap);
    this.enable = true;
  }

  disactivate() {
    if (!this.enable) {
      return;
    }
    this.#object.removeAllListeners();
    this.#object.container.eventMode = 'none';
    this.#object.container.off('tap', this.#bus.tap);
    this.enable = false;
  }
}

export default IObjectEventManager;
