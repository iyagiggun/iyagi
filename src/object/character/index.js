import { Assets } from 'pixi.js';
import IObject from '..';
import { TRANSPARENT_1PX_IMG } from '../../utils';

const ICharacter = {
  /**
   * @param {import('./type').ICharacterParameter} p
   */
  create: (p) => {
    const obj = IObject.create(p);

    const curPhotoKey = 'default';
    const photoMap = p.photoMap || { default: TRANSPARENT_1PX_IMG };
    /**
   * @type Object.<string, import('pixi.js').Texture> | undefined
   */
    let photoTextureMap;

    const loadPhotoMap = () => {
      const promiseList = Object.keys(photoMap)
        .map((photoKey) => Assets.load(photoMap[photoKey])
          .then((texture) => ({
            photo_key: photoKey,
            texture,
          })));
      return Promise.all(promiseList).then((resultList) => {
        photoTextureMap = resultList.reduce((acc, result) => ({
          ...acc,
          [result.photo_key]: result.texture,
        }), {});
      });
    };

    const getPhotoTexture = () => {
      if (!photoTextureMap) {
        throw new Error('[character.get_photo_texture] not loaded');
      }
      return photoTextureMap[curPhotoKey];
    };
    return Object.freeze({
      ...obj,
      load: () => Promise.all([obj.load(), loadPhotoMap()]).then(() => undefined),
      getPhotoTexture,
    });
  },
};

export default ICharacter;
