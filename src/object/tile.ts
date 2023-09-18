import { ObjectParams, createObject } from '.';

export function createTile(params: ObjectParams) {
  const obj = createObject({
    ...params,
    z: params.z ?? 0,
  });
  return {
    ...obj,
  };
}
