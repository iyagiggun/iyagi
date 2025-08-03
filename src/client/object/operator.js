import { BASIC_SERVER_MESSAGE_TYPES } from '../../server/const/index.js';
import global from '../global/index.js';
import { Rectangle } from 'pixi.js';

/**
 * @type {import('./index.js').default[]}
 */
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

export const CLIENT_OBJECT_MESSAGE_HANDLER = {
  /**
   * @param {import('../message/index.js').ServerPayload} payload
   */
  [BASIC_SERVER_MESSAGE_TYPES.OBJECT_MOVE]: ({ message: { data } }) => {
    const target = find(data.target);
    const direction = data.direction;
    if (direction) {
      target.direction = direction;
    }
    return target.move(data);
  },
  /**
   * @param {import('../message/index.js').ServerPayload} payload
   */
  [BASIC_SERVER_MESSAGE_TYPES.OBJECT_TALK]: ({ message: { data } }) => {
    const target = find(data.target);
    return target.talk(data.message);
  },
  /**
   * @param {import('../message/index.js').ServerPayload} payload
   */
  [BASIC_SERVER_MESSAGE_TYPES.OBJECT_REMOVE]: ({ message: { data } }) => {
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
  /**
   * @param {import('../message/index.js').ServerPayload} payload
   */
  [BASIC_SERVER_MESSAGE_TYPES.OBJECT_ACTION]: ({ message: { data } }) => {
    const target = find(data.target);
    target.play({ motion: data.motion, ...data.options });
    return Promise.resolve();
  },

  /**
   * @param {import('../message/index.js').ServerPayload} payload
   */
  [BASIC_SERVER_MESSAGE_TYPES.CONTROL]: ({ message: { data } }) => {
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

  [BASIC_SERVER_MESSAGE_TYPES.CONTROL_RELEASE]: () => {
    const { controller, app } = global;
    if (!controller) {
      throw new Error('No controller.');
    }
    controller.release();
    app.stage.removeChild(controller.container);
  },
};


const ObjectOperator = {
  /**
   * @param {import('./index.js').default} o
   */
  push: (o) => {
    objects.push(o);
  },
};

export default ObjectOperator;
