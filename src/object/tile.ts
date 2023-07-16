import { object_prototype } from '.';

const tile_prototype = {
  ...Object.create(object_prototype) as typeof object_prototype,
  _init() {
    console.error(33);
  },
};

export { tile_prototype };