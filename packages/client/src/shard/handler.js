import { BUILT_IN_CLIENT_MESSAGE_TYPES, BUILT_IN_SERVER_MESSAGE_TYPES } from '@iyagi/commons';
import { shard } from './index.js';
import ObjectResource from '../object/resource.js';
import sender from '../sender/index.js';

/**
 * @type {string | null}
 */
let _current = null;

export const CLIENT_SHARD_MESSAGE_HANDLER = {

  [BUILT_IN_SERVER_MESSAGE_TYPES.SHARD_LOAD]: async (data) => {
    if (_current) {
      await shard.clear.before(shard.container);
      shard.container.removeChildren();
      await shard.clear.after(shard.container);
    }
    _current = data.shard.key;

    await shard.load.before(shard.container);

    await Promise.all(data.shard.resources.map(
      /**
      * @param {ReturnType<import('@iyagi/server/object').ObjResourceType['toClientData']>} r
       */
      (r) => {
        const resource = ObjectResource.pool.get(r.key) ?? new ObjectResource(r.key, r.sprite);
        return resource.load();
      }
    ));

    await Promise.all(data.shard.objects.map(
      /**
       * @param {ReturnType<import('@iyagi/server/object').ObjType['toClientData']>} info
       */
      (info) => {
        const resource = ObjectResource.pool.get(info.resource);
        if (!resource) {
          throw new Error(`Resource not found: ${info.resource}`);
        }
        const obj = resource.spawn(info.id, {
          name: info.name,
          portraits: info.portraits,
        });

        obj.xyz = info;
        obj.direction = info.direction;

        return shard.objects.add(obj);
      })
    );

    sender.send({
      type: BUILT_IN_CLIENT_MESSAGE_TYPES.SHARD_LOADED,
    });

    await shard.load.after(shard.container);
  },

  [BUILT_IN_SERVER_MESSAGE_TYPES.CAMERA_FOCUS]:
    (data) => shard.camera.move(data),

  [BUILT_IN_SERVER_MESSAGE_TYPES.CAMERA_FOLLOW]:
    (data) => {
      const target = shard.objects.find(data.target);
      return shard.camera.follow(target);
    },
};
