import { Application, Container } from 'pixi.js';
import { ObjectType } from '../object';
import { CharacterType } from '../object/character';
import { wait } from '../utils';
import { create_messenger } from './messenger';
import { create_camera } from './camera';
import { get_direction_by_delta, is_overlap } from '../utils/area';
import { create_controller } from './controller';

export type SceneProps = {
  name: string;
  object_list: ObjectType[];
}

export const create_scene = (app: Application, {
  // name,
  object_list: _object_list
}:SceneProps) => {

  const container = new Container;
  let object_list = _object_list.slice();
  const take_list: (() => Promise<void>)[] = [];
  // const event_target = new EventTarget();

  const camera = create_camera(app, container);
  const messenger = create_messenger(app);
  const controller = create_controller(app);

  const play = () => Promise.all(object_list.map((obj) => obj.load())) // load object list
    .then(() => {
    // draw map
      object_list.forEach((obj) => {
        container.addChild(obj.container);
      });
      app.stage.addChild(container);
      return Promise.resolve();
    })
    .then(() => {
    // play each take
      return take_list.reduce((last, current) => {
        return last.then(() => {
          return current();
        });
      }, Promise.resolve());
    })
    .then(() => {
      console.error('end!!');
    });

  const add_take = (take: () => Promise<void>) => {
    take_list.push(take);
  };

  const focus = (target: ObjectType, speed?: number) => {
    const { x, y } = target.get_center_position();
    return camera.move_to(x, y, speed);
  };

  const remove_object = (object: ObjectType) => {
    if (!object_list.includes(object)) {
      throw new Error(`[scene.remove_object] no object. ${object.name}`);
    }
    object_list = object_list.filter((each) => each !== object);
    container.removeChild(object.container);
  };

  const add_object = (object: ObjectType) => {
    if (object_list.includes(object)) {
      return;
    }
    object_list.push(object);
    container.addChild(object.container);
  };

  const show_message = (speaker: CharacterType, message: string) => messenger.show_message({
    speaker,
    message
  });

  const get_next_x = (object: ObjectType, delta_x: number) => {
    const { x, y, z, w, h } = object.get_area();
    const dest_x = x + delta_x;
    const blocking_object = object_list.find((_object) => {
      if (_object === object || _object.get_position().z == z) {
        return false;
      }
      return is_overlap({ x: dest_x, y, w, h }, object.get_area());
    });
    if (blocking_object) {
      const { x: blocking_x, w: blocking_w } = blocking_object.get_area();
      return x < blocking_x ? blocking_x - blocking_w : blocking_x + blocking_w;
    }
    return dest_x;
  };

  const get_next_y = (object: ObjectType, delta_y: number) => {
    const { x, y, z, w, h } = object.get_area();
    const dest_y = y + delta_y;
    const blocking_object = object_list.find((_object) => {
      if (_object === object || _object.get_position().z == z) {
        return false;
      }
      return is_overlap({ x, y: dest_y, w, h }, object.get_area());
    });
    if (blocking_object) {
      const { y: blocking_y, h: blocking_h } = blocking_object.get_area();
      return y < blocking_y ? blocking_y - blocking_h : blocking_y + blocking_h;
    }
    return dest_y;
  };

  const move = (target: ObjectType, delta_x: number, delta_y:number) => {
    const next_x = get_next_x(target, delta_x);
    const next_y = get_next_y(target, delta_y);
    target.set_position(next_x, next_y);
    target.set_direction(get_direction_by_delta(delta_x, delta_y));
  };

  const move_object = (target: ObjectType, x: number, y: number, options?: {
    speed?: number
    focusing?: boolean
  }) => new Promise<void>((resolve) => {
    const { ticker } = app;
    const speed = options?.speed ?? 1;
    const tick = () => {
      const { x: cur_x, y: cur_y } = target.get_position();
      const diff_x = x - cur_x;
      const diff_y = y - cur_y;
      const distance = Math.sqrt(diff_x ** 2 + diff_y ** 2);
      const arrived = distance < speed;

      if (arrived) {
        target.set_position(x, y);
      } else {
        const delta_x = speed * (diff_x / distance);
        const delta_y = speed * (diff_y / distance);
        move(target, delta_x, delta_y);
        target.play(speed);
        if (options?.focusing) {
          focus(target);
        }
      }

      if (arrived) {
        ticker.remove(tick);
        target.stop();
        resolve();
      }
    };
    target.play(speed);
    ticker.add(tick);
  });

  const control = (player: CharacterType) => {
    controller.control();
    controller.on('move', (data) => {
      move(player, data.delta_x, data.delta_y);
      player.play(data.delta_level);
    });
    controller.on('stop', () => {
      player.stop();
    });
  };

  return Object.freeze({
    container,
    play,
    add_take,
    add_object,
    remove_object,
    show_message,
    focus,
    move_object,
    control,

    wait
  });
};

export type SceneType = ReturnType<typeof create_scene>;
