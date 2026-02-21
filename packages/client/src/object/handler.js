import { BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { Rectangle } from 'pixi.js';
import global from '../global/index.js';
import { shard } from '../shard/index.js';

export const CLIENT_OBJECT_MESSAGE_HANDLER = {
  [BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_MOVE]: (data) => {
    const target = shard.objects.find(data.target);
    const direction = data.direction;
    if (direction) {
      target.direction = direction;
    }
    return target.move(data);
  },
  [BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_TALK]: (data) => {
    const target = shard.objects.find(data.target);
    return target.talk(data.message);
  },
  [BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_REMOVE]: (data) => {
    const target = shard.objects.find(data.id);
    if (target) {
      const parent = target.container.parent;
      if (parent) {
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
  [BUILT_IN_SERVER_MESSAGE_TYPES.OBJECT_ACTION]: (data) => {
    const target = shard.objects.find(data.target);
    target.play({ motion: data.motion, ...data.options });
    return Promise.resolve();
  },
};

