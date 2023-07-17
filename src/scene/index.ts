import { Container } from 'pixi.js';
import { DevTools } from '../utils';

const ScenePrototype = {
  name: '',
  container: new Container(),
  _init(name: string) {
    this.name = name;
  },
  async load() {
    DevTools.isDebugMode() && console.debug(`[scene] ${this.name}. load start.`);
    DevTools.isDebugMode() && console.debug(`[scene] ${this.name}. load end.`);
  }
};

export { ScenePrototype };
