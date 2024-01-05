class IEvents {
  #container;

  /**
   * @param {import("pixi.js").Container} container
   */
  constructor(container) {
    this.#container = container;
  }

  /**
   * @param {(function(): void) | null} onTap
   */
  set onTap(onTap) {
    if ((typeof onTap) !== 'function') {
      this.#container.eventMode = undefined;
      this.#container.ontap = undefined;
      return;
    }
    this.#container.eventMode = 'static';
    this.#container.ontap = () => onTap();
  }

  get onTap() {
    return this.#container.ontap;
  }
}

export default IEvents;
