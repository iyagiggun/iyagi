import { ObjectOptions, ObjectPrototype } from '.';

export type TileOptions = ObjectOptions & {
  test: 1
}

const Inheritor = {
  ...{} as typeof ObjectPrototype,
  _init(name: string, options: TileOptions) {
    ObjectPrototype._init.call(this, name, options);
  }
};

const TilePrototype = Object.assign(Object.create(ObjectPrototype), Inheritor) as typeof Inheritor;

type TileType = typeof TilePrototype;

export { TilePrototype, TileType };