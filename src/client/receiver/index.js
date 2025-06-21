import camera from '../camera/index.js';
import { effect } from '../effect/index.js';
import ObjectManager from '../object/manager.js';
import { shard } from '../shard/index.js';

/**
 * @param {import('../../server/const/index.js').ServerMessage} message
 * @param {import('../const/index.js').ClientReply} reply
 */
const resolve = (message, reply) => {
  const data = message.data;

  switch (message.type) {

    case 'wait': {
      return new Promise((resolve) => {
        window.setTimeout(resolve, data.delay);
      });
    }

    case 'shard.load':
      return shard.load(message, reply);

    case 'shard.clear':
      return shard.clear();

    case 'shard.remove':
      return ObjectManager.remove(data);

    case 'camera.focus':
      return camera.move(data);

    case 'object.talk':
      return ObjectManager.talk(data);

    case 'object.move':
      return ObjectManager.move(data);

    case 'object.motion':
      return ObjectManager.motion(data);

    case 'shard.control':
      return ObjectManager.control(data);

    case 'shard.release':
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

/**
 * @param {object} p
 * @param {import('../const/index.js').ClientReply} p.reply
 * @param {import('../../server/const/index.js').ServerMessage[]} p.message
 */

const ask = async ({
  message,
  reply,
}) => {
  return message.reduce(
    (prev, msg) => prev.then(() => resolve(msg, reply)),
    Promise.resolve()
  );
};

export const ClientReceiver = {
  ask,
};
