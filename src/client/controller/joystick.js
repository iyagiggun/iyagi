
/**
 * @typedef {{
 *  container: import('pixi.js').Container;
 *  start: import('../../commons/coords.js').XY;
 *  pointerId: number;
 * }} JoystickInfo
 */

import { Graphics } from 'pixi.js';
import global from '../global/index.js';

export default class Joystick {

  #container;

  #anchor;
  #offset;

  #et;

  /** @type {number | null} */
  #pointerId = null;

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

    this.#anchor = new Graphics();
    this.#anchor.circle(0, 0, 10);
    this.#anchor.fill({
      color: 0xff0000,
      alpha: 0.4,
    });

    this.#offset = new Graphics();
    this.#offset.circle(0, 0, 10);
    this.#offset.fill({
      color: 0x0000ff,
      alpha: 0.4,
    });

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

    this.#offset.x = this.#anchor.x + this.#delta.x;
    this.#offset.y = this.#anchor.y + this.#delta.y;
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
   *  start: import('../../commons/coords.js').XY;
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

    const app = global.app;
    const center = {
      x: app.canvas.width / 2,
      y: app.canvas.height / 2,
    };

    this.#anchor.x = center.x;
    this.#anchor.y = center.y;
    this.#offset.x = center.x;
    this.#offset.y = center.y;
    this.#container.addChild(this.#anchor);
    this.#container.addChild(this.#offset);
    // player.application.ticker.add(tick);
  }

  /**
   * @param {number} [pointerId]
   * @returns
   */
  release(pointerId) {
    if (pointerId !== undefined && (pointerId === null || pointerId !== this.#pointerId)) {
      return;
    }
    window.clearInterval(this.#intervalId);
    if (performance.now() - this.#activateTime < 200 && Math.abs(this.#delta.x) < 5 && Math.abs(this.#delta.y) < 5) {
      this.#et.dispatchEvent(new CustomEvent('interaction'));
    }
    this.#pointerId = null;
    this.#delta = { x: 0, y: 0 };
    this.#intervalId = 0;
    this.#activateTime = -1;
    this.#container.removeEventListener('touchmove', this.#onTouchMove);

    this.#container.removeChild(this.#anchor);
    this.#container.removeChild(this.#offset);
    // player.application.ticker.remove(tick);
  }
}
