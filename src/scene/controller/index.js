import { Sprite } from 'pixi.js';
import { throttle } from 'lodash-es';
import { TRANSPARENT_1PX_IMG } from '../../utils';
import IApplication from '../../application';

/** @type {import('pixi.js').Sprite | undefined} */
let sprite;

/**
 * @typedef { 'move' | 'stop' } EventType
 */

const getSprite = () => {
  if (!sprite) {
    const { width, height } = IApplication.get().view;
    sprite = Sprite.from(TRANSPARENT_1PX_IMG);
    sprite.width = width;
    sprite.height = height;
  }
  return sprite;
};

/**
 * @param {number} distance
 * @returns
 */
export const getDeltaLevel = (distance) => {
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

const IController = {
  create: () => {
    const app = IApplication.get();

    const controller = getSprite();
    const eventTarget = new EventTarget();

    /** @type {number | undefined} */
    let joystickId;
    let startX = 0;
    let startY = 0;
    let deltaLevel = 0;
    let deltaX = 0;
    let deltaY = 0;

    const { ticker } = app;
    const tick = () => {
      eventTarget.dispatchEvent(new CustomEvent('move', { detail: { deltaX, deltaY } }));
    };

    const releaseJoystick = () => {
      joystickId = undefined;
      ticker.remove(tick);
    };

    controller.addEventListener('touchstart', (evt) => {
      const { x, y } = evt.global;
      if (x < app.view.width / 2) {
      // case:: joystick on
        startX = x;
        startY = y;
        joystickId = evt.pointerId;
        ticker.add(tick);
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
    controller.addEventListener('touchmove', throttle((evt) => {
      if (joystickId === evt.pointerId) {
        const { x, y } = evt.global;
        const diffX = x - startX;
        const diffY = y - startY;
        const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
        if (distance === 0) {
          return;
        }
        deltaLevel = getDeltaLevel(distance);
        if (deltaLevel === 0) {
          deltaX = 0;
          deltaY = 0;
          return;
        }
        deltaX = Math.round((diffX * deltaLevel) / distance);
        deltaY = Math.round((diffY * deltaLevel) / distance);

        eventTarget.dispatchEvent(new CustomEvent('move', { detail: { deltaX, deltaY } }));
      // event_emitter.emit('move', { delta_level, delta_x, delta_y });
      }
    }, 50));

    controller.addEventListener('touchend', (evt) => {
      if (joystickId === evt.pointerId) {
        eventTarget.dispatchEvent(new CustomEvent('stop'));
        releaseJoystick();
      }
    });

    const control = () => {
      app.stage.addChild(controller);
      controller.eventMode = 'static';
    };

    /**
     *
     * @param {'stop' | 'move'} type
     * @param {(evt: any) => void} handler
     */
    const on = (type, handler) => {
      eventTarget.addEventListener(type, handler);
    };

    return Object.freeze({
      control,
      on,
    });
  },
};

export default IController;
