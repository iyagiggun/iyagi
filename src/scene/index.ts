import { Container } from 'pixi.js';
import { ObjectPrototype } from '../object';

interface ScenePrototype {
  name: string;
  _objectList?: ObjectPrototype[];
  _container?: Container;
  _init(name: string, objectList: ObjectPrototype[]): void;
  getContainer(): Container;
  load(): Promise<void>;
  setup(): void;
}

const ScenePrototype: ScenePrototype = {
  name: '',
  _init(name: string, objectList: ObjectPrototype[]) {
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
    });
  }
};

export { ScenePrototype };
