import { ObjectOptions, ObjectPrototype } from '.';

export interface CharacterOptions extends ObjectOptions {

}

interface CharacterPrototype extends ObjectPrototype {
  _init(name: string, options: CharacterOptions): void;
}

const Inheritor: CharacterPrototype = {
  ...{} as typeof ObjectPrototype,
  _init(name: string, options: CharacterOptions) {
    ObjectPrototype._init.call(this, name, options);
  }
};

const CharacterPrototype = Object.assign(Object.create(ObjectPrototype), Inheritor) as CharacterPrototype;

export { CharacterPrototype };