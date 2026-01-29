import global from '../global/index.js';
import { Rectangle } from 'pixi.js';
import { client_object_manager } from './manager.js';
import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import camera from '../camera/index.js';

/**
 * @param {string} id
 */
const find = (id) => {
  return client_object_manager.find(id);
};

export const CLIENT_OBJECT_MESSAGE_HANDLER = {
  /**
   * @param {import('@iyagi/server/const').ServerMessage} message
   */
  [BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_MOVE]: ({ data }) => {
    const target = find(data.target);
    const direction = data.direction;
    if (direction) {
      target.direction = direction;
    }
    return target.move(data);
  },
  /**
   * @param {import('@iyagi/server/const').ServerMessage} message
   */
  [BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_TALK]: ({ data }) => {
    const target = find(data.target);
    return target.talk(data.message);
  },
  /**
   * @param {import('@iyagi/server/const').ServerMessage} message
   */
  [BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_REMOVE]: ({ data }) => {
    const target = client_object_manager.find(data.id);
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
  /**
   * @param {import('@iyagi/server/const').ServerMessage} message
   */
  [BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_ACTION]: ({ data }) => {
    const target = find(data.target);
    target.play({ motion: data.motion, ...data.options });
    return Promise.resolve();
  },

  /**
   * @param {import('@iyagi/server/const').ServerMessage} message
   */
  [BUILT_IN_SERVER_MESSAGE_TYPES.CONTROL]: ({ data }) => {
    const { controller, app } = global;
    if (!controller) {
      throw new Error('No controller.');
    }
    const { width, height } = app.screen;

    const target = find(data.target);
    controller.target = target;
    camera.target = target;

    const cc = controller.container;
    cc.hitArea = new Rectangle(0, 0, width, height);
    app.stage.addChild(cc);

    return Promise.resolve();
  },

  [BUILT_IN_SERVER_MESSAGE_TYPES.CONTROL_RELEASE]: () => {
    const { controller, app } = global;
    if (!controller) {
      throw new Error('No controller.');
    }
    controller.release();
    app.stage.removeChild(controller.container);
  },
};

