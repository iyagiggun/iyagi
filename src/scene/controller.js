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

const layer = Sprite.from(TRANSPARENT_1PX_IMG);
layer.eventMode = 'static';

const release = () => {
  const { parent } = layer;
  if (!parent) {
    return;
  }
  layer.removeAllListeners();
  parent.removeChild(layer);
};

/**
 * @param {EachController} controller
 */
const activate = (controller) => {
  release();
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
