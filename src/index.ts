import application from './application';
import { create_director } from './director';
import { ObjectProps, create_object } from './object';
import { create_character } from './object/character';
import { create_tile } from './object/tile';
import { SceneProps, create_scene } from './scene';
import { DevTools } from './utils';
import { Area, Direction } from './utils/area';

type IyagiOptions = {
  debug?: boolean;
}

const IyagiPrototype = {
  _init () {
  },
  create_director () {
    return create_director();
  },
  create_scene (props: SceneProps) {
    return create_scene(props);
  },
  create_object (props: ObjectProps) {
    return create_object(props);
  },
  create_tile (props: ObjectProps) {
    return create_tile(props);
  },
  create_character (props: ObjectProps) {
    return create_character(props);
  },
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