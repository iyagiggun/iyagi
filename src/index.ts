import application from './application';
import { DirectorPrototype } from './director';
import { ObjectOptions, ObjectPrototype } from './object';
import { CharacterOptions, CharacterPrototype } from './object/character';
import { TileOptions, TilePrototype } from './object/tile';
import { ScenePrototype } from './scene';
import { DevTools } from './utils';
import { Area, Direction } from './utils/area';

type IyagiOptions = {
  debug?: boolean;
}

const IyagiPrototype = {
  _init () {
  },
  createDirector () {
    const i = Object.create(DirectorPrototype) as DirectorPrototype;
    i._init();
    return i;
  },
  createScene (name: string, objectList: ObjectPrototype[]) {
    const i = Object.create(ScenePrototype) as ScenePrototype;
    i._init(name, objectList);
    return i;
  },
  createObject (name: string, options: ObjectOptions) {
    const i = Object.create(ObjectPrototype) as ObjectPrototype;
    i._init(name, options);
    return i;
  },
  createTile (name: string, options: TileOptions) {
    const i = Object.create(TilePrototype) as TilePrototype;
    i._init(name, options);
    return i;
  },
  createCharacter (name: string, options: CharacterOptions) {
    const i = Object.create(CharacterPrototype) as CharacterPrototype;
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

export { Area, Direction };
export default iyagi;