import { Application } from 'pixi.js';
import { createObject } from './object';
import { createCharacter } from './object/character';
import { createTile } from './object/tile';
import { SceneParams, createScene } from './scene';
import { DevTools } from './utils';
import { Area, Direction } from './utils/area';

type IyagiOptions = {
  debug?: boolean;
}

function createIyagi(canvas: HTMLCanvasElement, options?: IyagiOptions) {

  if (options?.debug === true) {
    DevTools.enableDebug();
  }

  const app = new Application({
    view: canvas,
    backgroundColor: 0x000000,
    width: parseInt(getComputedStyle(canvas).width, 10),
    height: parseInt(getComputedStyle(canvas).height, 10),
  });

  return {
    createScene(params: SceneParams) {
      return createScene(app, params);
    },
    createObject,
    createCharacter,
    createTile,
  };
}

export {
  Area,
  Direction,
  createIyagi
};

