import { AnimatedSprite, Assets, Sprite, Spritesheet, Texture } from 'pixi.js';
import { DEFAULT_ANIMATION_SPEED } from '../const/index.js';

/**
 * @typedef {import('../coords/index.js').Area} Area
 * @typedef {import('../coords/index.js').Direction} Direction
 */

/**
 * @param {string} motion
 * @param {string} direction
 */
export const getMDKey = (motion, direction) => `${motion}:${direction}`;

let frameNo = 0;

/**
 * @param {import('./resource.js').SpriteImage} image
 * @param {Object} options
 * @param {Area[]} [options.frames]
 * @param {boolean} [options.scale]
 */
const createTexture = async (image, options) => {
  /** @type {Texture} */
  const texture = await Assets.load(image.url);
  if (!options || !options.frames || options.frames.length === 0) {
    return texture;
  }
  const sheet = {
    frames: options.frames.reduce((acc, frame) => ({
      ...acc,
      [`${frameNo++}`]: {
        frame,
      },
    }), {}),
    meta: {
      scale: image.scale ?? 1,
    },
  };
  const parsed = await new Spritesheet(texture, sheet).parse();
  const textures = Object.values(parsed);
  if (options.frames.length === 1) {
    return textures[0];
  }

  return textures;
};

export default class ITexture {

  #info;

  /** @type {{[key: string]: Texture | Texture[] | undefined }} */
  #motions = {};

  #loaded = false;

  /**
   * @param {import('./resource.js').SpriteInfo} info
   */
  constructor(info) {
    this.#info = info;
  }

  async load() {
    if (this.#loaded) {
      return this;
    }

    /** @type {{[key: string]: import('./resource.js').Motion}} */
    const motions = this.#info.motions;

    const promises = Object.keys(motions)
      .map(async (motion) => {

        const default_image = motions[motion].image ?? this.#info.image;

        const promisesInMotion = Object.entries(motions[motion]).map(async ([direction, value]) => {
          if (typeof value !== 'object' || ('frames' in value) === false) {
            return;
          }
          const image = value.image || default_image;
          if (!image) {
            throw new Error('Fail to create texture. No image.');
          }
          this.#motions[getMDKey(motion, direction)] = await createTexture(image, value);
        });

        await Promise.all(promisesInMotion);
      });

    await Promise.all(promises);
    this.#loaded = true;

    return this;
  }

  /**
   * @param {string} motion
   * @param {Direction} direction
   */
  createSprite(motion, direction) {
    if (!this.#loaded) {
      throw new Error('Fail to create sprite. Texture is not loaded.');
    }
    const data = this.#motions[getMDKey(motion, direction)];
    if (!data) {
      throw new Error(`Fail to create sprite. No texture data. ${JSON.stringify(this.#info)}-${motion}:${direction}`);
    }

    if (data instanceof Texture) {
      return Sprite.from(data);
    }

    const as = new AnimatedSprite(data);
    as.animationSpeed = 1 * DEFAULT_ANIMATION_SPEED;
    as.loop = this.#info.motions?.[motion]?.loop ?? true;
    return as;
  }
}
