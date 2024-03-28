import { Application } from 'pixi.js';
import { devtools } from '../utils/devtools';

/**
 * @typedef {import('../scene').IScene} IScene
 */

class Iyagi {
  application;

  /** @type {Object<string, IScene>} */
  #sceneMap = {};

  /** @type {WeakMap<any, IScene>} */
  #sceneWeakMap = new WeakMap();

  /**
   * @param {Object} p
   * @param {HTMLCanvasElement} p.canvas
   * @param {IScene[]} p.scenes
   * @param {'production' | 'development'} [p.mode] default="production"
   */
  constructor({ canvas, scenes, mode }) {
    this.application = new Application({
      view: canvas,
      backgroundColor: 0x000000,
      width: parseInt(getComputedStyle(canvas).width, 10),
      height: parseInt(getComputedStyle(canvas).height, 10),
    });

    scenes.forEach((scene) => {
      const { key } = scene;
      if (typeof key === 'string') {
        this.#sceneMap[key] = scene;
      } else {
        this.#sceneWeakMap.set(key, scene);
      }
    });

    if (mode === 'development') {
      devtools.enable = true;
    }
  }

  /**
   * @param {any} key
   */
  async play(key) {
    const scene = typeof key === 'string' ? this.#sceneMap[key] : this.#sceneWeakMap.get(key);
    if (!scene) {
      throw new Error('Fail to find scene.');
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
