import { IObject } from '..';

/**
 * @typedef {{ in: import('../index').IObject, target: ITile }} ITileEventInData
 * @typedef {{ out: import('../index').IObject, target: ITile }} ITileEventOutData
 */

class ITile extends IObject {
  /**
   * @param {import('..').MonoParameter} p
   */
  constructor({
    name, image, frames, hitbox,
  }) {
    super({
      name,
      image,
      motions: {
        default: {
          down: {
            frames,
          },
          hitbox,
        },
      },
      z: 0,
    });
  }
}

export { ITile };
