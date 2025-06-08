import camera from '../camera/index.js';
import { effect } from '../effect/index.js';
import ObjectManager from '../object/manager.js';
import { shard } from '../shard/index.js';

/**
 * @typedef {Object} SubjectData
 * @property {import('../const/index.js').ClientMessage} message
 * @property {(message: import('../const/index.js').ClientMessage) => void} reply
 */

/**
 * @param {SubjectData} p
 */
const ask = async ({
  message,
  reply,
}) => {
  const data = message.data;

  switch (message.type) {

    case 'wait': {
      return new Promise((resolve) => {
        window.setTimeout(resolve, data.delay);
      });
    }

    case 'list':
      return data.list.reduce(
        (prev, msg) => prev.then(() => ask({ message: msg, reply })), Promise.resolve());

    case 'shard.load':
      return shard.load({ message, reply });

    case 'shard.clear':
      return shard.clear();

    case 'camera.focus':
      return camera.move(data);

    case 'object.talk':
      return ObjectManager.talk(data);

    case 'object.move':
      return ObjectManager.move(data);

    case 'object.remove':
      return ObjectManager.remove(data);

    case 'object.motion':
      return ObjectManager.motion(data);

    case 'object.control':
      return ObjectManager.control(data);

    case 'object.release':
      return ObjectManager.release();

    case 'effect.fade.in':
      return effect.fadeIn(data);

    case 'effect.fade.out':
      return effect.fadeOut(data);

    default: {
      throw new Error(`client recieve unknown message. ${JSON.stringify(message)}`);
    }
  }
};

export const ClientReceiver = {
  ask,
};
