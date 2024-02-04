import { Application } from 'pixi.js';
import { devtools } from '../utils/devtools';

class Iyagi {
  application;

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} options
   * @param {'production' | 'development'} [options.mode] default="production"
   */
  constructor(canvas, options) {
    this.application = new Application({
      view: canvas,
      backgroundColor: 0x000000,
      width: parseInt(getComputedStyle(canvas).width, 10),
      height: parseInt(getComputedStyle(canvas).height, 10),
    });

    if (options.mode === 'development') {
      devtools.enable = true;
    }
  }

  /**
   * @param {import('../scene').IScene} scene
   */
  async play(scene) {
    await scene.load();
    this.application.stage.addChild(scene.container);
    // eslint-disable-next-line no-param-reassign
    scene.iyagi = this;
    const next = (await scene.take()) ?? scene;
    this.application.stage.removeChild(scene.container);
    scene.release();
    await this.play(next);
  }
}

export { Iyagi };
