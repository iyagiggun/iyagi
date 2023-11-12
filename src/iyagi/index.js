import { Application } from 'pixi.js';
import IApplication from '../application';
import Debuger from '../utils/debugger';

const Iyagi = {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} [options]
   * @param {boolean} [options.debug]
   */
  create: (canvas, options) => {
    Debuger.enable(options?.debug ?? false);
    const app = new Application({
      view: canvas,
      backgroundColor: 0x000000,
      width: parseInt(getComputedStyle(canvas).width, 10),
      height: parseInt(getComputedStyle(canvas).height, 10),
    });
    IApplication.set(app);
    return {};
  },
};

export default Iyagi;
