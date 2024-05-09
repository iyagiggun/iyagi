import EventEmitter from 'events';
import { GestureDetector } from './gesture';
import { Joystick } from './joystick';

const listenerMap = new WeakMap();

class IPlayerController extends EventEmitter {
  player;

  /**
   * @param {import('../object/character').ICharacter} player
   */
  constructor(player) {
    super();
    this.player = player;
  }

  /**
   * @param {import('pixi.js').Sprite} layer
   */
  activate(layer) {
    const app = this.player.application;
    const { scene } = this.player;
    if (!scene) {
      throw new Error('No scene.');
    }
    const { width } = app.screen;

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

    layer.on('touchstart', (evt) => {
      const { x, y } = evt.global;
      if (isJoystickArea(x)) {
        Joystick.activate({
          layer,
          player: this.player,
          pointerId: evt.pointerId,
          start: { x, y },
        });
      }
      if (isActionArea(x)) {
        GestureDetector.activate({
          layer,
          player: this.player,
          pointerId: evt.pointerId,
          eventEmitter: this,
        });
      }
    });

    layer.on('touchend', (evt) => {
      const { pointerId } = evt;
      Joystick.release(pointerId);
      GestureDetector.release(pointerId);
    });

    scene.camera.point(this.player);
    scene.camera.target = this.player;
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
