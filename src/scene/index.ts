import { Application, Container } from 'pixi.js';
import { ObjectType } from '../object';
import { CharacterType } from '../object/character';
import { wait } from '../utils';
import { show_message } from './messenger';

export type SceneProps = {
  name: string;
  object_list: ObjectType[];
}

export const create_scene = (application: Application, {
  // name,
  object_list: _object_list
}:SceneProps) => {

  const container = new Container;
  let object_list = _object_list.slice();
  const take_list: (() => Promise<void>)[] = [];
  // const event_target = new EventTarget();

  return {

    container,

    play() {
      return Promise.all(object_list.map((obj) => obj.load())) // load object list
        .then(() => {
          // draw map
          object_list.forEach((obj) => {
            container.addChild(obj.container);
          });
          application.stage.addChild(container);
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
    },

    add_take(take: (() => Promise<void>)) {
      take_list.push(take);
    },

    remove_object(target: ObjectType) {
      if (!object_list.includes(target)) {
        throw new Error(`[scene.remove_object] no object. ${target.name}`);
      }
      object_list = object_list.filter((each) => each !== target);
      container.removeChild(target.container);
    },

    add_object(target: ObjectType) {
      if (object_list.includes(target)) {
        return;
      }
      object_list.push(target);
      container.addChild(target.container);
    },

    show_message(speaker: CharacterType, message: string) {
      show_message({
        application,
        speaker,
        message
      });
    },

    // on(evt: SceneEvent, handler: () => void) {
    //   event_target.addEventListener(evt, handler);
    // },

    // off(evt: SceneEvent, handler: () => void) {
    //   event_target.removeEventListener(evt,handler);
    // }

    wait
  };
};

export type SceneType = ReturnType<typeof create_scene>;
