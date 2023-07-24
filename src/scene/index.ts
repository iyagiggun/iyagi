import { Container } from 'pixi.js';
import { ObjectType } from '../object';

const ScenePrototype = {
  name: '',
  _objectList: undefined as undefined | ObjectType[],
  _container: undefined as undefined | Container,
  _init(name: string, objectList: ObjectType[]) {
    this.name = name;
    this._objectList = objectList;
    this._container = new Container();
  },
  getContainer() {
    if (!this._container) {
      throw new Error(`[scene.getContainer] no container. ${this.name}`);
    }
    return this._container;
  },
  async load() {
    const objectList = this._objectList;
    if (!objectList) {
      throw new Error('[Scene.load] not inited.');
    }
    await Promise.all(objectList.map((obj) => obj.load()));
  },
  setup() {
    this._objectList?.forEach((obj) => {
      this._container?.addChild(obj.getContainer());
      console.error(obj.name, obj.getPos());
    });
  }
};

type SceneType = typeof ScenePrototype;

export { ScenePrototype, SceneType };
