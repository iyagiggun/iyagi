import application from '../application';
import { ScenePrototype } from '../scene';

interface DirectorPrototype {
  scene?: ScenePrototype;
  _init(): void;
  play(scene: ScenePrototype): Promise<void>;
}

const DirectorPrototype: DirectorPrototype = {
  _init () {
  },
  async play (scene: ScenePrototype) {
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

