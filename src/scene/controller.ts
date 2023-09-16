import EventEmitter from 'eventemitter3';
import { throttle } from 'lodash-es';
import { Application, FederatedPointerEvent, Sprite } from 'pixi.js';
import { TRANSPARENT_1PX_IMG } from '../utils';

let sprite: Sprite | undefined;

type DeltaLevel = 0 | 1 | 2 | 3;
type MoveEventHandler = (data: { delta_level: DeltaLevel, delta_x: number, delta_y: number }) => void;
type ActionEventHandler = (name: string) => void;

type AddEventListener = {
  (event_type: 'move', handler: MoveEventHandler): void;
  (event_type: 'stop', handler: () => void ): void;
  (event_type: 'action', handler: ActionEventHandler): void;
}

const get_sprite = (app: Application) => {
  if (!sprite) {
    const { width, height } = app.view;
    sprite = Sprite.from(TRANSPARENT_1PX_IMG);
    sprite.width = width;
    sprite.height = height;
  }
  return sprite;
};

export const get_delta_level = (distance: number): DeltaLevel => {
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

const create_controller = (app: Application) => {

  const controller = get_sprite(app);
  const event_emitter = new EventEmitter();

  let joystick_id: undefined | number = undefined;
  let start_x = 0;
  let start_y = 0;
  let delta_level = 0;
  let delta_x = 0;
  let delta_y = 0;

  const { ticker } = app;
  const tick = () => {
    event_emitter.emit('move', {
      delta_x, delta_y
    });
  };

  const release_joystick = () => {
    joystick_id = undefined;
    ticker.remove(tick);
  };

  controller.addEventListener('touchstart', (evt) => {
    const { x, y } = evt.global;
    if (x < app.view.width / 2) {
      // case:: joystick on
      start_x = x;
      start_y = y;
      joystick_id = evt.pointerId;
      ticker.add(tick);
    } else {
      // console.error(this.controlMode);
      // case:: interact
      // const interaction = this.getInteraction();
      // if (!interaction) {
      //   return;
      // }
      // controller.interactive = false;
      release_joystick();
      // player.stop();
      // ticker.remove(tick);
      // interaction().then(() => {
      //   controller.interactive = true;
      // });
    }
  });
  controller.addEventListener('touchmove', throttle((evt: FederatedPointerEvent) => {
    if (joystick_id === evt.pointerId) {
      const { x, y } = evt.global;
      const diffX = x - start_x;
      const diffY = y - start_y;
      const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
      if (distance === 0) {
        return;
      }
      delta_level = get_delta_level(distance);
      if (delta_level === 0) {
        delta_x = 0;
        delta_y = 0;
        return;
      }
      delta_x = Math.round((diffX * delta_level) / distance);
      delta_y = Math.round((diffY * delta_level) / distance);

      event_emitter.emit('move', { delta_level, delta_x, delta_y });
    }
  }, 50));

  controller.addEventListener('touchend', (evt) => {
    if (joystick_id === evt.pointerId) {
      event_emitter.emit('stop');
      release_joystick();
    }
  });

  const control = () => {
    app.stage.addChild(controller);
    controller.interactive = true;
  };

  const on: AddEventListener = (event_type, handler) => {
    event_emitter.on(event_type, handler);
  };

  return {
    control,
    on,
  };
};

export { create_controller };
