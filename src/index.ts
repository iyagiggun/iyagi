import { Application } from 'pixi.js';
import { ObjectProps, create_object } from './object';
import { create_character } from './object/character';
import { create_tile } from './object/tile';
import { SceneProps, create_scene } from './scene';
import { DevTools } from './utils';
import { Area, Direction } from './utils/area';

type IyagiOptions = {
  debug?: boolean;
}

function create_iyagi(canvas: HTMLCanvasElement, options?: IyagiOptions) {

  if (options?.debug === true) {
    DevTools.enableDebug();
  }

  const application = new Application({
    view: canvas,
    backgroundColor: 0x000000,
    width: parseInt(getComputedStyle(canvas).width, 10),
    height: parseInt(getComputedStyle(canvas).height, 10),
  });

  return {

    create_scene (props: SceneProps) {
      return create_scene(application, props);
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
}
export {
  Area,
  Direction, create_iyagi
};
