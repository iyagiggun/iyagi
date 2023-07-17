import application from './application';
import { DirectorPrototype } from './director';
import { ObjectOptions, ObjectPrototype } from './object';
import { ScenePrototype } from './scene';
import { DevTools } from './utils';

type IyagiOptions = {
  debug?: boolean;
}

const IyagiPrototype = {
  _init () {
  },
  createDirector () {
    const i = Object.create(DirectorPrototype) as typeof DirectorPrototype;
    i._init();
    return i;
  },
  createScene (name: string) {
    const i = Object.create(ScenePrototype) as typeof ScenePrototype;
    i._init(name);
    return i;
  },
  createObject (name: string, options: ObjectOptions) {
    const i = Object.create(ObjectPrototype) as typeof ObjectPrototype;
    i._init(name, options);
    return i;
  }
};

function iyagi (canvas: HTMLCanvasElement, options?: IyagiOptions) {
  application.set(canvas);

  if (options?.debug === true) {
    DevTools.enableDebug();
  }

  const obj = Object.create(IyagiPrototype) as typeof IyagiPrototype;
  obj._init();

  return obj;
}

export default iyagi;