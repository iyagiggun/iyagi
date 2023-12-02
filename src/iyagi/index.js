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
    const application = new Application({
      view: canvas,
      backgroundColor: 0x000000,
      width: parseInt(getComputedStyle(canvas).width, 10),
      height: parseInt(getComputedStyle(canvas).height, 10),
    });
    IApplication.set(application);
    return {
      application,
    };
  },
};

export default Iyagi;
