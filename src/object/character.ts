import { Assets, Texture } from 'pixi.js';
import { ObjectParams, createObject } from '.';
import { TRANSPARENT_1PX_IMG } from '../utils';

export type CharacterParams = ObjectParams & {
  photo_map?: {
    default: string;
    [key: string]: string;
  }
}

export const createCharacter = (props: CharacterParams) => {
  const obj = createObject(props);

  const cur_photo_key = 'default';
  const photo_map = props.photo_map || { default: TRANSPARENT_1PX_IMG };
  let photo_texture_map: { [key: string]: Texture };

  const load_photo_map = function () {
    const promise_list = Object.keys(photo_map)
      .map((photo_key) => {
        return Assets.load<Texture>(photo_map[photo_key])
          .then((texture) => ({
            photo_key,
            texture
          }));
      });
    return Promise.all(promise_list).then((result_list) => {
      photo_texture_map = result_list.reduce<{ [key: string]: Texture }>((acc, result) => {
        return {
          ...acc,
          [result.photo_key]: result.texture
        };
      }, {});
    });
  };

  return {
    ...obj,

    load() {
      return Promise.all([
        obj.load(),
        load_photo_map()
      ]).then(() => undefined);
    },

    get_photo_texture() {
      if (!photo_texture_map) {
        throw new Error('[character.get_photo_texture] not loaded');
      }
      return photo_texture_map[cur_photo_key];
    }
  };
};

export type CharacterType = ReturnType<typeof createCharacter>;
