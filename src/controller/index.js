import EventEmitter from 'events';
import { GestureDetector } from './gesture';
import { Joystick } from './joystick';

const { Sprite } = require('pixi.js');
const { TRANSPARENT_1PX_IMG } = require('../utils');

const listenerMap = new WeakMap();

class IPlayerController extends EventEmitter {
  #layer = Sprite.from(TRANSPARENT_1PX_IMG);

  #player;

  /**
   * @param {import('../object/character').ICharacter} player
   */
  constructor(player) {
    super();
    this.#player = player;
  }

  control() {
    const app = this.#player.application();
    const { scene } = this.#player;
    if (!scene) {
      throw new Error('No scene.');
    }
    const { width, height } = app.view;
    this.#layer.width = width;
    this.#layer.height = height;
    this.#layer.eventMode = 'static';

    /**
     * @param {number} x
     * @returns
     */
    const isJoystickArea = (x) => x < width / 2;
    /**
     * @param {number} x
     * @returns
     */
    const isActionArea = (x) => x > width / 2;

    this.#layer.ontouchstart = (evt) => {
      const { x, y } = evt.global;
      if (isJoystickArea(x)) {
        Joystick.activate({
          layer: this.#layer,
          player: this.#player,
          pointerId: evt.pointerId,
          start: { x, y },
        });
      }
      if (isActionArea(x)) {
        GestureDetector.activate({
          layer: this.#layer,
          player: this.#player,
          pointerId: evt.pointerId,
          eventEmitter: this,
        });
      }
    };

    this.#layer.ontouchend = (evt) => {
      const { pointerId } = evt;
      Joystick.release(pointerId);
      GestureDetector.release(pointerId);
    };

    app.stage.addChild(this.#layer);
    scene.camera.pointTo(this.#player);
    scene.camera.target = this.#player;
  }

  /**
   * @param {string} type tap or /^[→←↑↓]+$/
   * @param {() => void} listener
   * @returns
   */
  on(type, listener) {
    if (!listenerMap.has(listener)) {
      listenerMap.set(listener, () => {
        listener();
      });
    }
    const l = listenerMap.get(listener);
    super.on(type, l);
    return this;
  }

  /**
   * @param {string} type tap or /^[→←↑↓]+$/
   * @param {() => void} listener
   * @returns
   */
  off(type, listener) {
    const l = listenerMap.get(listener);
    if (!l) {
      return this;
    }
    super.off(type, l);
    return this;
  }
}

export { IPlayerController };
