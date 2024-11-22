/**
 * @typedef {Object} Server
 * @property {(type: string, handler: () => void) => void} on
 */

import { IMT } from './const/message.js';
import { getNextPosition } from './coords/index.js';
import global from './global.js';
import { onSceneEvent } from './scene/index.js';
import UserUtils from './user/index.js';

/**
 * @param {*} msg
 */
const onMessage = (msg) => {
  // DEUG
  console.debug('server recieve', JSON.parse(msg));

  const sender = global.sender;

  const { key, type, data } = JSON.parse(`${msg}`);
  const user = UserUtils.find(key);

  onSceneEvent({ user, type, data });

  // common
  switch(type) {
    case IMT.MOVE:
    {
      const target = user.objects.find((o) => o.name === data.target);
      if (!target) {
        throw new Error(`Fail to move. No target (${data.target}).`);
      }
      const next_position = getNextPosition({ target, objects: user.objects, destination: data.position });
      if (next_position) {
        target.position = next_position;
        sender.send({
          type: IMT.MOVE,
          data: {
            target: data.target,
            position: next_position,
          },
        });
      }
    }
  }

};

/**
 * @param {import('./global.js').GlobalParams} p
 */
const init = ({
  send,
  scenes,
}) => {
  global.init({ send, scenes });
};

const receiver = {
  init,
  onMessage,
};

export default receiver;
