import { easeInOutSine } from '@iyagi/commons/coords';
import global from '../global/index.js';
import { CLIENT_OBJECT_CONTAINER_LABEL } from '../object/index.js';
import { client_object_manager } from '../object/manager.js';
import { shard_container } from '../shard/commons.js';
import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';

/**
 * @param {Object} target
 * @param {string} target.type
 * @param {string} target.id
 */
const toObject = (target) => {
  return client_object_manager.find(target.id);
};

/**
 * @param {Object} target
 * @param {string} target.type
 * @param {string} target.id
 */
const toContainer = (target) => {
  switch (target.type) {
    case 'SHARD':
      return shard_container;
    case 'OBJECT':
      return toObject(target).container;
    default:
      throw new Error(`Unknown target type: ${target.type}`);
  }
};

export const CLIENT_EFFECT_MESSAGE_HANDLER = {
  /**
   * @param {import('@iyagi/server/const').ServerMessage} param0
   */
  [BUILT_IN_SERVER_MESSAGE_TYPES.EFFECT_FADE_IN]: ({ data }) => {
    const ticker = global.app.ticker;
    const delta = 0.05;
    const container = toContainer(data.target);

    return new Promise((resolve) => {
      const process = () => {
        if (container.alpha >= 1) {
          container.alpha = 1;
          ticker.remove(process);
          resolve();
        }
        container.alpha += delta;
      };
      ticker.add(process);
    });
  },
  /**
   * @param {import('@iyagi/server/const').ServerMessage} param0
   */
  [BUILT_IN_SERVER_MESSAGE_TYPES.EFFECT_FADE_OUT]: ({ data }) => {
    const ticker = global.app.ticker;
    const delta = 0.05;
    const container = toContainer(data.target);
    return new Promise((resolve) => {
      const process = () => {
        if (container.alpha <= 0) {
          container.alpha = 0;
          ticker.remove(process);
          resolve();
        }
        container.alpha -= delta;
      };
      ticker.add(process);
    });
  },
  /**
   * @param {import('@iyagi/server/const').ServerMessage} param0
   */
  [BUILT_IN_SERVER_MESSAGE_TYPES.EFFECT_SHAKE]: ({ data }) => {
    const ticker = global.app.ticker;
    const container = toContainer(data.target);

    return new Promise((resolve) => {

      const beforeX = container.x;

      let idx = 0;
      const process = () => {
        container.x = beforeX + (idx % 2 === 0 ? 1 : -1);
        idx++;
      };
      ticker.add(process);
      setTimeout(() => {
        ticker.remove(process);
        container.x = beforeX;
        resolve();
      }, data.duration || 100);
    });
  },
  /**
   * @param {import('@iyagi/server/const').ServerMessage} param0
   */
  [BUILT_IN_SERVER_MESSAGE_TYPES.EFFECT_JUMP]: ({ data }) => {
    const ticker = global.app.ticker;

    const object = toObject(data.target);
    const container = object.container;

    const jumpHeight = 18;
    const duration = 18; // 프레임 수 (약 0.67초 @60fps)
    let frame = 0;

    const notShadow = container.children.filter((child) => child.label !== CLIENT_OBJECT_CONTAINER_LABEL.SHADOW);
    let lastEased = 0;

    return new Promise((resolve) => {
      const process = () => {
        frame++;
        const t = Math.min(frame / duration, 1);
        const eased = t < 0.5 ? easeInOutSine(t * 2) : easeInOutSine((1 - t) * 2);
        const diff = (eased - lastEased) * jumpHeight;
        notShadow.forEach((each) => {
          each.y -= diff;
        });
        lastEased = eased;
        if (t >= 1) {
          ticker.remove(process);
          resolve();
        }
      };
      ticker.add(process);
    });
    // return new Promise((resolve) => {
    //   const process = () => {
    //     container.x += (Math.random() - 0.5) * 10;
    //     container.y += (Math.random() - 0.5) * 10;
    //   };
    //   ticker.add(process);
    //   setTimeout(() => {
    //     ticker.remove(process);
    //     resolve();
    //   }, data.duration || 1000);
    // });
  },
};
