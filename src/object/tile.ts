import { ObjectOptions, ObjectPrototype } from '.';

export type TileOptions = ObjectOptions & {
  test: 1
}

interface TilePrototype extends ObjectPrototype {
  _init(name: string, options: TileOptions): void
}

const Inheritor: TilePrototype = {
  ...{} as typeof ObjectPrototype,
  _init(name: string, options: TileOptions) {
    ObjectPrototype._init.call(this, name, options);
  }
};

const TilePrototype = Object.assign(Object.create(ObjectPrototype), Inheritor) as typeof Inheritor;

export { TilePrototype };