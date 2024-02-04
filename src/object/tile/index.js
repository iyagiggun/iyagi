/* eslint-disable no-param-reassign */

import { IObject } from '..';
import { ITileEvent } from './event';

class ITile extends IObject {
  /** @type {ITileEvent} */
  event;

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
    this.event = new ITileEvent(this);
  }
}

export { ITile };
