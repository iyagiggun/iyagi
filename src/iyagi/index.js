import { Application } from 'pixi.js';
import IApplication from '../application';
import Debuger from '../utils/debugger';

const Iyagi = {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {import('../scene').ISceneCreated} title
   * @param {Object} [options]
   * @param {boolean} [options.debug]
   */
  create: (canvas, title, options) => {
    Debuger.enable(options?.debug ?? false);

    let scene = title;

    const application = new Application({
      view: canvas,
      backgroundColor: 0x000000,
      width: parseInt(getComputedStyle(canvas).width, 10),
      height: parseInt(getComputedStyle(canvas).height, 10),
    });

    IApplication.set(application);

    const ret = {
      application,
      /**
       * scene 의 play 에서 scene 을 return 받아서 계속 play 하도록 처리
       * 값이 없으면 title 로 넘어갈 것
       */
      play: () => {
        IApplication.get().stage.addChild(scene.container);

        return scene.play().then((next) => {
          IApplication.get().stage.removeChild(scene.container);
          scene = next;
          return ret.play();
        });
      },
    };
    return Object.freeze(ret);
  },
};

export default Iyagi;
