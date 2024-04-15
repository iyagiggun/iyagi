import { Application } from 'pixi.js';
import { devtools } from '../utils/devtools';
import { imessenger } from '../messenger';

/**
 * @typedef {import('../scene').IScene} IScene
 */

class Iyagi {
  application;

  messenger;

  /**
   * @param {Object} p
   * @param {HTMLCanvasElement} p.canvas
   * @param {typeof imessenger} [p.messenger]
   * @param {'production' | 'development'} [p.mode] default="production"
   */
  constructor({
    canvas, mode, messenger,
  }) {
    this.application = new Application({
      view: canvas,
      backgroundColor: 0x000000,
      width: parseInt(getComputedStyle(canvas).width, 10),
      height: parseInt(getComputedStyle(canvas).height, 10),
    });

    this.messenger = messenger ?? imessenger;

    if (mode === 'development') {
      devtools.enable = true;
    }
  }

  /**
   * @param {any} key
   * @param {IScene[]} scenes
   */
  async play(key, scenes) {
    const scene = scenes.find((s) => s.key === key);
    if (!scene) {
      throw new Error('Fail to find scene.');
    }

    await scene.load();
    this.application.stage.addChild(scene.container);
    // eslint-disable-next-line no-param-reassign
    scene.iyagi = this;
    const next = await scene.take(scene);
    this.application.stage.removeChild(scene.container);
    scene.release();
    await this.play(next, scenes);
  }
}

export { Iyagi };
