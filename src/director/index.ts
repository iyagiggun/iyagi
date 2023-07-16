import { scene_prototype } from '../scene';

const director_prototype = {
  _cur_scene: undefined as typeof scene_prototype | undefined,
  _init () {
  },
  async play (scene: typeof scene_prototype) {
    if(this._cur_scene) {
      this._cur_scene = scene;
    }
    await scene.load();
    console.error('start!!!');
  }
};

export { director_prototype };

