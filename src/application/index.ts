import { Application } from 'pixi.js';

let application: undefined | Application;

export default {
  set(app: Application) {
    application = app;
  },
  get() {
    if (!application) {
      throw new Error('[application] application was not been assigned');
    }
    return application;
  }
};