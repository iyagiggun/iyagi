import global from '../global/index.js';
import { Rectangle } from 'pixi.js';

const objects = [];

/**
 * @param {string} id
 */
const find = (id) => {
  const obj = objects.find((obj) => obj.id === id);
  if (!obj) {
    throw new Error('Fail to find object.');
  }
  return obj;
};


const ObjectManager = {
  push: (o) => {
    objects.push(o);
  },

  move: (data) => {
    const target = find(data.target);
    const direction = data.direction;
    if (direction) {
      target.direction = direction;
    }
    return target.move(data);
  },

  talk: (data) => {
    const target = find(data.target);
    return target.talk(data.message);
  },

  control: (data) => {
    const { controller, app } = global;
    if (!controller) {
      throw new Error('No controller.');
    }
    const { width, height } = app.screen;
    controller.target = find(data.target);
    const cc = controller.container;
    cc.hitArea = new Rectangle(0, 0, width, height);
    app.stage.addChild(cc);

    return Promise.resolve();
  },

  release: () => {
    const { controller, app } = global;
    if (!controller) {
      throw new Error('No controller.');
    }
    controller.release();
    app.stage.removeChild(controller.container);
  },

  remove: (data) => {
    const target = objects.find((obj) => obj.id === data.id);
    if (target) {
      const parent = target.container.parent;
      if (parent){
        parent.removeChild(target.container);
      }
    }
    // const idx = objects.findIndex((obj) => obj.id === data.id);
    // if (idx >= 0) {
    //   objects.splice(idx, 1).forEach((removed) => {
    //     const parent = removed.container.parent;
    //     if (parent){
    //       parent.removeChild(removed.container);
    //     }
    //   });
    // }
    return Promise.resolve();
  },

  motion: (data) => {
    const target = find(data.target);
    target.set(data.motion);
    return Promise.resolve();
  },
};

export default ObjectManager;
