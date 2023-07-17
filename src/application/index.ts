import { Application } from 'pixi.js';

let application: undefined | Application;

export default {
  set(canvas: HTMLCanvasElement) {

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`Fail to create iyagi. ${canvas} is not a canvas`);
    }

    application = new Application({
      view: canvas,
      backgroundColor: 0x000000,
      width: parseInt(getComputedStyle(canvas).width, 10),
      height: parseInt(getComputedStyle(canvas).height, 10),
    });
  },
  get() {
    if (!application) {
      throw new Error('[application] application was not been assigned');
    }
    return application;
  }
};