import application from '../application';
import { ScenePrototype } from '../scene';

const DirectorPrototype = {
  scene: undefined as typeof ScenePrototype | undefined,
  _init () {
  },
  async play (scene: typeof ScenePrototype) {
    if(this.scene) {
      this.scene = scene;
      application.get().stage.removeChild(scene.container);
    }
    await scene.load();

    application.get().stage.addChild(scene.container);
  }
};

export { DirectorPrototype };

