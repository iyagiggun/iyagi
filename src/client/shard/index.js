import { Container } from 'pixi.js';
import ObjectResource from '../object/resource.js';
import resource from '../resource/index.js';
import ObjectOperator from '../object/operator.js';

const container = new Container();

const clear = () => {
  container.removeChildren();
};

/**
 * @param {import('../../server/const/index.js').ServerMessage} message
 * @param {import('../const/index.js').ClientReply} reply
 */
const load = async (message, reply) => {

  const data = message.data;

  await Promise.all(data.shard.objects.map(async (info) => {
    if (!resource.objects.contains(info.resource)) {
      resource.objects.add(new ObjectResource(info.resource, info));
    }

    const object_resource = resource.objects.find(info.resource);
    const obj = (await object_resource.load()).stamp(info.id);
    obj.xyz = info;
    obj.direction = info.direction;
    container.addChild(obj.container);
    ObjectOperator.push(obj);
    return obj;
  }));
  reply({
    type: 'shard.loaded',
  });
};

export const shard = {
  container,
  load,
  clear,
};
