import { AnimatedSprite, Sprite } from 'pixi.js';

/**
 *
 * @param {Sprite | AnimatedSprite} sprite
 * @returns
 */
export const getFlipHorizontalSprite = (sprite) => {
  const cSprite = (() => {
    if (sprite instanceof AnimatedSprite) {
      const ret = new AnimatedSprite(sprite.textures);
      ret.loop = sprite.loop;
      ret.animationSpeed = sprite.animationSpeed;
      return ret;
    }
    return new Sprite(sprite.texture);
  })();

  cSprite.anchor.x = 1;
  cSprite.scale.x = -1;

  return cSprite;
};
