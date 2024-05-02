import { Application, Graphics } from 'pixi.js';
import { devtools } from '../utils/devtools';
import { imessenger } from '../messenger';

/**
 * @typedef {import('../scene').IScene} IScene
 */

class Iyagi {
  application;

  messenger;

  #inited = false;

  /**
   * @param {Object} p
   * @param {typeof imessenger} [p.messenger]
   * @param {'production' | 'development'} [p.mode] default="production"
   */
  constructor({
    mode, messenger,
  }) {
    this.application = new Application();

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
    if (!this.#inited) {
      await this.application.init({
        backgroundColor: 0x000000,
        resizeTo: window,
      });
      this.#inited = true;
      document.body.appendChild(this.application.canvas);
    }

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
