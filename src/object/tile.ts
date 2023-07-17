import { ObjectPrototype } from '.';

const TilePrototype = {
  ...Object.create(ObjectPrototype) as typeof ObjectPrototype,
  _init() {
    console.error(33);
  },
};

export { TilePrototype };