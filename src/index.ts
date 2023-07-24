import application from './application';
import { DirectorPrototype } from './director';
import { ObjectOptions, ObjectPrototype, ObjectType } from './object';
import { TileOptions, TilePrototype, TileType } from './object/tile';
import { ScenePrototype, SceneType } from './scene';
import { DevTools } from './utils';
import { Area } from './utils/area';

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
  createScene (name: string, objectList: ObjectType[]) {
    const i = Object.create(ScenePrototype) as SceneType;
    i._init(name, objectList);
    return i;
  },
  createObject (name: string, options: ObjectOptions) {
    const i = Object.create(ObjectPrototype) as ObjectType;
    i._init(name, options);
    return i;
  },
  createTile (name: string, options: TileOptions) {
    const i = Object.create(TilePrototype) as TileType;
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

export { Area };
export default iyagi;