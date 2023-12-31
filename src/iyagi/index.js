import { Application } from 'pixi.js';
import IApplication from '../application';
import Debuger from '../utils/debugger';

const Iyagi = {
  /** @type {import('../scene').default | null} */
  scene: null,
  /** @type {import('../scene').default | null} */
  title: null,
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {import('../scene').default} title
   * @param {Object} [options]
   * @param {boolean} [options.debug]
   */
  set(canvas, title, options) {
    Debuger.enable(options?.debug ?? false);

    const application = new Application({
      view: canvas,
      backgroundColor: 0x000000,
      width: parseInt(getComputedStyle(canvas).width, 10),
      height: parseInt(getComputedStyle(canvas).height, 10),
    });

    this.title = title;
    this.scene = title;

    IApplication.set(application);
  },
  async play() {
    if (!this.scene || !this.title) {
      throw new Error('Not set yet.');
    }
    const { title } = this;
    const application = IApplication.get();
    application.stage.addChild(this.scene.container);

    const next = await this.scene.play();
    application.stage.removeChild(this.scene.container);
    this.scene = next ?? title;
    await this.play();
  },
};

export default Iyagi;
