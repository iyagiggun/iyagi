import { Application, Container } from 'pixi.js';
import { ObjectType } from '../object';
import { CharacterType } from '../object/character';
import { wait } from '../utils';
import { create_messenger } from './messenger';
import { create_camera } from './camera';

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

  const focus = (target: ObjectType, speed: number) => {
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

  return Object.freeze({
    container,
    play,
    add_take,
    remove_object,
    add_object,
    show_message,
    focus,

    wait
  });
};

export type SceneType = ReturnType<typeof create_scene>;
