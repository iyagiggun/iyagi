import application from '../application';
import { SceneType } from '../scene';

const DirectorPrototype = {
  scene: undefined as SceneType | undefined,
  _init () {
  },
  async play (scene: SceneType) {
    if(this.scene) {
      this.scene = scene;
      application.get().stage.removeChild(scene.getContainer());
    }
    await scene.load();
    scene.setup();
    application.get().stage.addChild(scene.getContainer());
  }
};

export { DirectorPrototype };

