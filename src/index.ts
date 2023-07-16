import { Application } from 'pixi.js';
import { director_prototype } from './director';
import { scene_prototype } from './scene';
import { object_prototype } from './object';
import dev_tools from './dev_tools';
import application from './application';

type IyagiOptions = {
  debug?: boolean;
}

const iyagi_prototype = {
  _init () {
  },
  create_director () {
    const i = Object.create(director_prototype) as typeof director_prototype;
    i._init();
    return i;
  },
  create_scene () {
    const i = Object.create(scene_prototype) as typeof scene_prototype;
    i._init();
    return i;
  },
  create_object (name: string) {
    const i = Object.create(object_prototype) as typeof object_prototype;
    i._init(name);
    return i;
  }
};

function iyagi (canvas: HTMLCanvasElement, options?: IyagiOptions) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error(`Fail to create iyagi. ${canvas} is not a canvas`);
  }
  const app = new Application({
    view: canvas,
    backgroundColor: 0x000000,
    width: parseInt(getComputedStyle(canvas).width, 10),
    height: parseInt(getComputedStyle(canvas).height, 10),
  });

  application.set(app);

  if (options?.debug === true) {
    dev_tools.enableDebug();
  }

  const obj = Object.create(iyagi_prototype) as typeof iyagi_prototype;
  obj._init();

  return obj;
}

export default iyagi;