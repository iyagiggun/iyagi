import { Application } from 'pixi.js';
import { devtools } from '../utils/devtools';

/**
 * @typedef {import('../scene').IScene} IScene
 */

class Iyagi {
  application;

  #scenes;

  /**
   * @param {Object} p
   * @param {HTMLCanvasElement} p.canvas
   * @param {Object<string, IScene> | WeakMap<any, IScene> | Map<any, IScene>} p.scenes
   * @param {'production' | 'development'} [p.mode] default="production"
   */
  constructor({ canvas, scenes, mode }) {
    this.application = new Application({
      view: canvas,
      backgroundColor: 0x000000,
      width: parseInt(getComputedStyle(canvas).width, 10),
      height: parseInt(getComputedStyle(canvas).height, 10),
    });

    this.#scenes = scenes;

    if (mode === 'development') {
      devtools.enable = true;
    }
  }

  /**
   * @param {any} sceneKey
   */
  async play(sceneKey) {
    const scene = (this.#scenes instanceof WeakMap || this.#scenes instanceof Map)
      ? this.#scenes.get(sceneKey)
      : this.#scenes[sceneKey];
    if (!scene) {
      throw new Error('Fail to play scene. No the scene');
    }

    await scene.load();
    this.application.stage.addChild(scene.container);
    // eslint-disable-next-line no-param-reassign
    scene.iyagi = this;
    const next = await scene.take();
    this.application.stage.removeChild(scene.container);
    scene.release();
    await this.play(next);
  }
}

export { Iyagi };
