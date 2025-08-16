import { Container } from 'pixi.js';
import ObjectResource from '../object/resource.js';
import ObjectOperator from '../object/operator.js';
import { BASIC_CLIENT_MESSAGE_TYPES } from '../const/index.js';
import global from '../global/index.js';

const container = new Container();

const clear = () => {
  container.removeChildren();
};

/**
 * @type {Map<string, ObjectResource>}
 */
const resource_pool = new Map();

/**
 * @param {import('../../server/const/index.js').ServerMessage} message
 */
const load = async (message) => {

  const data = message.data;

  await Promise.all(
    data.shard.resources.map(
      /**
       * @param {ReturnType<import('../../server/object/resource.js').ServerObjectResource['toClientData']>} r
       */
      (r) => {
        const cached = resource_pool.get(r.key);
        if (cached) {
          return cached.load();
        }
        const created = new ObjectResource(r.data);
        resource_pool.set(r.key, created);
        return created.load();
      }
    )
  );

  data.shard.objects.map(
    /**
     * @param {ReturnType<import('../../server/object/index.js').ServerObject['toClientData']>} info
     * @returns
     */
    (info) => {
      const resource = resource_pool.get(info.resource);
      if (!resource) {
        throw new Error(`Resource not found: ${info.resource}`);
      }
      const obj = resource.stamp(info.id, {
        name: info.name,
      });
      obj.xyz = info;
      obj.direction = info.direction;
      container.addChild(obj.container);
      ObjectOperator.push(obj);
      return obj;
    });

  global.app.stage.addChild(container);
  global.reply({
    type: BASIC_CLIENT_MESSAGE_TYPES.SHARD_LOADED,
  });
};

export const shard = {
  container,
  load,
  clear,
};
