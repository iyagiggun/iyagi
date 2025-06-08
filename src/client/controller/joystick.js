
/**
 * @typedef {{
 *  container: import('pixi.js').Container;
 *  start: import('../coords/index.js').XY;
 *  pointerId: number;
 * }} JoystickInfo
 */

export default class Joystick {

  #container;

  #et;

  #pointerId = -1;

  #activateTime = -1;

  #start = { x: 0, y: 0 };

  #delta = { x:0 , y: 0 };

  #rate;

  #intervalId = 0;

  /**
   * @param {{
   *  container: import('pixi.js').Container;
   *  rate: number;
   *  eventTarget: EventTarget;
   * }} p
   */
  constructor({
    container,
    rate,
    eventTarget,
  }) {
    this.#container = container;
    this.#et = eventTarget;
    this.#rate = rate ?? 50;
  }

  /**
   * @param { import('pixi.js').FederatedPointerEvent } evt
   */
  #onTouchMove(evt) {
    if (evt.pointerId !== this.#pointerId) {
      return;
    }
    if (evt.pointerId !== this.#pointerId) {
      return;
    }

    const { x, y } = evt.global;
    this.#delta.x = x - this.#start.x;
    this.#delta.y = y - this.#start.y;
    // const { player } = info;
    // if (distance === 0) {
    //   return;
    // }
    // const speed = calcSpeed(distance);
    // if (speed === 0) {
    //   this.#deltaX = 0;
    //   this.#deltaY = 0;
    //   // player.stop();
    //   return;
    // }
    // this.#deltaX = Math.round((diffX * speed) / distance);
    // this.#deltaY = Math.round((diffY * speed) / distance);

    // console.error(this.#deltaX, this.#deltaY);
    // player.play({ speed });
  }

  /**
   * @param {number} x
   */
  isIn(x) {
    return x < window.innerWidth / 2;
  }

  /**
   * @param {{
   *  pointerId: number;
   *  start: import('../coords/index.js').XY;
   * }} p
   */
  activate({
    pointerId,
    start,
  }) {
    this.#pointerId = pointerId;
    this.#start = start;
    this.#container.addEventListener('touchmove', this.#onTouchMove.bind(this));
    this.#activateTime = performance.now();
    this.#intervalId = window.setInterval(() => {
      this.#et.dispatchEvent(
        new CustomEvent('move',
          {
            detail:{
              delta: this.#delta,
            },
          }
        ));

    }, this.#rate);
    // player.application.ticker.add(tick);
  }

  /**
   * @param {number} [pointerId]
   * @returns
   */
  release(pointerId) {
    if (pointerId !== undefined && (pointerId !== this.#pointerId || this.#pointerId < 0)) {
      return;
    }
    window.clearInterval(this.#intervalId);
    if (performance.now() - this.#activateTime < 200 && Math.abs(this.#delta.x) < 5 && Math.abs(this.#delta.y) < 5) {
      this.#et.dispatchEvent(new CustomEvent('interact'));
    }
    this.#pointerId = -1;
    this.#delta = { x: 0, y: 0 };
    this.#intervalId = 0;
    this.#activateTime = -1;
    this.#container.removeEventListener('touchmove', this.#onTouchMove);
    // player.application.ticker.remove(tick);
  }
}
