import { Application, Container } from 'pixi.js';
import { ObjectType } from '../object';

export type SceneProps = {
  name: string;
  object_list: ObjectType[];
}

type SceneEvent = 'start';

export const create_scene = (application: Application, {
  // name,
  object_list
}:SceneProps) => {

  const container = new Container;
  const event_target = new EventTarget();
  const take_list: (() => Promise<void>)[] = [];

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

    add_take_list(_take_list: (() => Promise<void>)[]) {
      take_list.push(..._take_list);
    },

    on(evt: SceneEvent, handler: () => void) {
      event_target.addEventListener(evt, handler);
    },

    off(evt: SceneEvent, handler: () => void) {
      event_target.removeEventListener(evt,handler);
    }

  };
};

export type SceneType = ReturnType<typeof create_scene>;
