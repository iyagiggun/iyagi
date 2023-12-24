import {
  AnimatedSprite, Assets, Sprite, Spritesheet, Texture,
} from 'pixi.js';

let frameIdx = 0;

const getFrameId = () => {
  frameIdx += 1;
  return `iyagi:isprite:frame:${frameIdx}`;
};

/**
 * @typedef {Object} ISpriteOptions
 * @property {string} url
 * @property {import('../utils/coordinates').Area[]} [frames]
 * @property {import('../utils/coordinates').Area} [hitbox]
 */

const ISprite = {
  /**
   * @param {string} url
   * @param {ISpriteOptions} [options]
   */
  create: (url, options) => {
    /**
     * @type { Sprite | AnimatedSprite | null }
     */
    let sprite = null;

    const ret = {
      isLoaded: () => !!sprite,
      load: () => {
        if (sprite) {
          return Promise.resolve();
        }

        const frames = options?.frames ?? [];

        return Assets.load(url).then((texture) => {
          // case: without frames
          if (frames.length === 0) {
            sprite = Sprite.from(texture);
            return Promise.resolve();
          }
          // case: with frames
          if (frames.length > 0) {
            const sheet = {
              frames: frames.reduce((acc, frame) => ({
                ...acc,
                [getFrameId()]: {
                  frame,
                },
              }), {}),
              meta: {
                scale: '1',
              },
            };

            return new Spritesheet(texture, sheet).parse().then(() => {
              const frameIds = Object.keys(sheet.frames).map((key) => Texture.from(key));
              sprite = frameIds.length === 1
                ? new Sprite(frameIds[0]) // case: non animated
                : new AnimatedSprite(frameIds); // case: animated
            });
          }
          return Promise.reject(new Error('[iyagi] no frames'));
        });
      },
      get: () => {
        if (!sprite) {
          throw new Error('[iyagi] sprite is not loaded.');
        }
        return sprite;
      },
    };
    return ret;
  },

};

export default ISprite;
