import { Container } from 'pixi.js';
import ObjectResource from '../object/resource.js';
import global from '../global/index.js';
import { client_object_manager } from '../object/manager.js';
import { BUILT_IN_CLIENT_MESSAGE_TYPES } from '@iyagi/commons';
import sender from '../sender/index.js';

const container = new Container();

const clear = () => {
  container.removeChildren();
};

/**
 * @type {Map<string, ObjectResource>}
 */
const resource_pool = new Map();

/**
 * @param {import('@iyagi/server/const').ServerMessage} message
 */
const load = async (message) => {

  /**
   * @type {{
   *  shard: {
   *   resources: ReturnType<import('@iyagi/server/object/resource.js').ServerObjectResource['toClientData']>[],
   *   objects: ReturnType<import('@iyagi/server/object/index.js').ServerObject['toClientData']>[]
   *  }
   * }}
   */
  const data = message.data;

  await Promise.all(data.shard.resources.map(
    /**
       * @param {ReturnType<import('@iyagi/server/object/resource.js').ServerObjectResource['toClientData']>} r
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
     * @param {ReturnType<import('@iyagi/server/object/index.js').ServerObject['toClientData']>} info
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
      container.addChild(obj.container);
      client_object_manager.push(obj);
      return obj.load();
    })
  );

  global.app.stage.addChild(container);

  sender.send({
    type: BUILT_IN_CLIENT_MESSAGE_TYPES.SHARD_LOADED,
  });
};

export const shard = {
  container,
  load,
  clear,
};
