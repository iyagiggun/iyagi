import { Joystick } from './joystick';

const { Sprite } = require('pixi.js');
const { TRANSPARENT_1PX_IMG } = require('../../utils');

const layer = Sprite.from(TRANSPARENT_1PX_IMG);

const IController = {
  /**
   * @param {import('../../object/character').ICharacter} player
   */
  control: (player) => {
    const app = player.application();
    const { scene } = player;
    if (!scene) {
      throw new Error('No scene.');
    }
    const { width, height } = app.view;
    layer.width = width;
    layer.height = height;
    layer.eventMode = 'static';

    /**
     * @param {number} x
     * @returns
     */
    const isJoystickArea = (x) => x < width / 2;
    /**
     * @param {number} x
     * @returns
     */
    const isActionArea = (x) => x > width / 2;

    layer.ontouchstart = (evt) => {
      const { x, y } = evt.global;
      if (isJoystickArea(x)) {
        Joystick.activate({
          layer,
          player,
          pointerId: evt.pointerId,
          start: { x, y },
        });
      } else {
        // Joystick.release();
      }
      if (isActionArea(x)) {
        console.error('action start');
      }
    };

    layer.ontouchend = (evt) => {
      const { pointerId } = evt;
      Joystick.release(pointerId);
    };

    app.stage.addChild(layer);
    scene.camera.pointTo(player);
    scene.camera.target = player;
  },
};

export { IController };
