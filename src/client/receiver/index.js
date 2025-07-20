import { BASIC_SERVER_MESSAGE_TYPES } from '../../server/const/index.js';
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

    case BASIC_SERVER_MESSAGE_TYPES.LOAD:
      shard.clear();
      return shard.load(message, reply);

    case BASIC_SERVER_MESSAGE_TYPES.OBJECT_REMOVE:
      return ObjectManager.remove(data);

    case BASIC_SERVER_MESSAGE_TYPES.CAMERA_FOCUS:
      return camera.move(data);

    case BASIC_SERVER_MESSAGE_TYPES.OBJECT_TALK:
      return ObjectManager.talk(data);

    case BASIC_SERVER_MESSAGE_TYPES.OBJECT_MOVE:
      return ObjectManager.move(data);

    case BASIC_SERVER_MESSAGE_TYPES.OBJECT_ACTION:
      return ObjectManager.motion(data);

    case BASIC_SERVER_MESSAGE_TYPES.CONTROL:
      return ObjectManager.control(data);

    case BASIC_SERVER_MESSAGE_TYPES.CONTROL_RELEASE:
      return ObjectManager.release();

    case BASIC_SERVER_MESSAGE_TYPES.EFFECT_FADE_IN:
      return effect.fadeIn(data);

    case BASIC_SERVER_MESSAGE_TYPES.EFFECT_FADE_OUT:
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
