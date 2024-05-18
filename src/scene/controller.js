import { Sprite } from 'pixi.js';
import { TRANSPARENT_1PX_IMG } from '../utils';

/**
 * @typedef {import('pixi.js').Application} Application
 */

/**
 * @typedef {Object} EachController
 * @property {import('../object/character').ICharacter} player
 * @property {(layer: Sprite) => void} activate
 */

/**
 * @type {Sprite[]}
 */
const layers = [];

const release = () => {
  let limit = 1024;
  while (layers.length > 0) {
    const layer = layers.pop();
    const parent = layer?.parent;
    if (!parent) {
      return;
    }
    layer.destroy();
    parent.removeChild(layer);
    limit -= 1;
    if (limit === 0) {
      throw new Error('release loops has been exceeded.');
    }
  }
};

/**
 * @param {EachController} controller
 */
const activate = (controller) => {
  release();

  const layer = Sprite.from(TRANSPARENT_1PX_IMG);
  layers.push(layer);
  layer.eventMode = 'static';

  const app = controller.player.application;
  const { width, height } = app.screen;
  layer.width = width;
  layer.height = height;
  controller.activate(layer);
  app.stage.addChild(layer);
};

const SceneController = {
  activate,
  release,
};

export default SceneController;
