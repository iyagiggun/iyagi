import { Container } from 'pixi.js';
import { ObjectType } from '../object';

export type SceneProps = {
  name: string;
  object_list: ObjectType[];
}

export const create_scene = ({
  // name,
  object_list
}:SceneProps) => {
  return {
    container: new Container(),
    load() {
      return Promise.all(object_list.map((obj) => obj.load()));
    },
    setup() {
      object_list.forEach((obj) => {
        this.container.addChild(obj.container);
      });
    }
  };
};

export type SceneType = ReturnType<typeof create_scene>;
