import ObjectResource from '../object/resource.js';
import global from '../global/index.js';
import { objects } from '../object/objects.js';
import { BUILT_IN_CLIENT_MESSAGE_TYPES } from '@iyagi/commons';
import sender from '../sender/index.js';
import { shard_container } from '../const/index.js';

const clear = () => {
  shard_container.removeChildren();
};

/**
 * @type {Map<string, ObjectResource>}
 */
const resource_pool = new Map();

/**
 * @param {{
 *  shard: {
 *    resources: ReturnType<import('@iyagi/server/object').ServerObjectResourceType['toClientData']>[],
 *    objects: ReturnType<import('@iyagi/server/object').ServerObjectType['toClientData']>[],
 *  }
 * }} data
 */
const load = async (data) => {

  await Promise.all(data.shard.resources.map(
    /**
    * @param {ReturnType<import('@iyagi/server/object').ServerObjectResourceType['toClientData']>} r
     */
    (r) => {
      const cached = resource_pool.get(r.key);
      if (cached) {
        return cached.load();
      }
      const created = new ObjectResource(r.sprite);
      resource_pool.set(r.key, created);
      return created.load();
    }
  ));

  await Promise.all(data.shard.objects.map(
    /**
     * @param {ReturnType<import('@iyagi/server/object').ServerObjectType['toClientData']>} info
     */
    (info) => {
      const resource = resource_pool.get(info.resource);
      if (!resource) {
        throw new Error(`Resource not found: ${info.resource}`);
      }
      const obj = resource.spawn(info.id, {
        name: info.name,
        portraits: info.portraits,
      });

      obj.xyz = info;
      obj.direction = info.direction;
      shard_container.addChild(obj.container);
      objects.push(obj);
      return obj.load();
    })
  );

  global.app.stage.addChild(shard_container);

  sender.send({
    type: BUILT_IN_CLIENT_MESSAGE_TYPES.SHARD_LOADED,
  });
};

export const shard = {
  load,
  clear,
};
