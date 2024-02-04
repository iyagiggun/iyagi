import { Sprite } from 'pixi.js';
import { throttle } from 'lodash-es';
import { TRANSPARENT_1PX_IMG } from '../../utils';
import { event } from '../../event';

/**
 * @typedef { 'move' | 'stop' } EventType
 */

/**
 * @param {number} distance
 * @returns
 */
export const calcSpeed = (distance) => {
  if (distance < 24) {
    return 0;
  }
  if (distance < 48) {
    return 1;
  }
  if (distance < 72) {
    return 2;
  }
  return 3;
};

/** @type {number | undefined} */
let joystickId;
let startX = 0;
let startY = 0;
let speed = 0;
let deltaX = 0;
let deltaY = 0;

const e = {
  move: event.createEventType(
    /**
     * @param {Object} p
     * @param {number} p.deltaX
     * @param {number} p.deltaY
     * @param {number} p.speed
     */
    // eslint-disable-next-line no-unused-vars, no-shadow
    ({ deltaX, deltaY, speed }) => undefined,
  ),
  stop: event.createEventType(
    () => undefined,
  ),
};

const tick = () => {
  e.move.fire({ deltaX, deltaY, speed });
};

/**
 * @param {import('pixi.js').Application} app
 * @returns
 */
const layer = (app) => {
  const sprite = Sprite.from(TRANSPARENT_1PX_IMG);

  const releaseJoystick = () => {
    joystickId = undefined;
    app.ticker.remove(tick);
  };

  const { width, height } = app.view;
  sprite.width = width;
  sprite.height = height;
  sprite.eventMode = 'static';

  sprite.addEventListener('touchstart', (evt) => {
    const { x, y } = evt.global;
    if (x < app.view.width / 2) {
      // case:: joystick on
      startX = x;
      startY = y;
      joystickId = evt.pointerId;
      app.ticker.add(tick);
    } else {
      // console.error(this.controlMode);
      // case:: interact
      // const interaction = this.getInteraction();
      // if (!interaction) {
      //   return;
      // }
      // controller.interactive = false;
      releaseJoystick();
      // player.stop();
      // ticker.remove(tick);
      // interaction().then(() => {
      //   controller.interactive = true;
      // });
    }
  });

  sprite.addEventListener('touchmove', throttle((evt) => {
    if (joystickId === evt.pointerId) {
      const { x, y } = evt.global;
      const diffX = x - startX;
      const diffY = y - startY;
      const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
      if (distance === 0) {
        return;
      }
      speed = calcSpeed(distance);
      if (speed === 0) {
        deltaX = 0;
        deltaY = 0;
        return;
      }
      deltaX = Math.round((diffX * speed) / distance);
      deltaY = Math.round((diffY * speed) / distance);

      e.move.fire({ deltaX, deltaY, speed });
    }
  }, 50));

  sprite.addEventListener('touchend', (evt) => {
    if (joystickId === evt.pointerId) {
      e.stop.fire(undefined);
      releaseJoystick();
    }
  });

  return sprite;
};

/**
 *
 * @param {import('pixi.js').Application} app
 */
const control = (app) => {
  app.stage.addChild(layer(app));
};

const BasicController = {
  control,
  event: e,
};

export { BasicController };
