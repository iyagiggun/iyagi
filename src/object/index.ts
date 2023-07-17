import { Container } from 'pixi.js';
import { Area } from '../application/area';

type SpriteAreaInfo = {
  areaList: Area[];
  collisionArea: Area;
}

export type ObjectOptions = {
  imgUrl: string;
  up?: SpriteAreaInfo;
  down: SpriteAreaInfo;
  left: SpriteAreaInfo;
  right: SpriteAreaInfo;
}

const ObjectPrototype = {
  name: '',
  container: new Container(),
  _init(name: string, options: ObjectOptions) {
    this.name = name;
    console.error(options);
  },
};

export { ObjectPrototype };
