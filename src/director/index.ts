import application from '../application';
import { SceneType } from '../scene';

export const create_director = () => {
  let cur_scene: SceneType | undefined;
  return {
    async play(scene: SceneType) {
      if (cur_scene) {
        application.get().stage.removeChild(cur_scene.container);
      }
      cur_scene = scene;
      await cur_scene.load();
      cur_scene.setup();
      application.get().stage.addChild(cur_scene.container);
    }
  };
};
