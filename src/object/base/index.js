/* eslint-disable max-classes-per-file */
import {
  AnimatedSprite,
  Assets,
  Container,
  Sprite,
  Spritesheet,
  Texture,
} from 'pixi.js';
import { FRAMES_PER_SECOND } from '../../const';

const Z_INDEX_MOD = 10000;
const DEFAULT_ANIMATION_SPEED = 6 / FRAMES_PER_SECOND; // 10 fps

let frameIdx = 0;

const getFrameId = () => {
  frameIdx += 1;
  return `iyagi:isprite:frame:${frameIdx}`;
};

/**
 * @param {string} image
 * @param {Object} options
 * @param {import('../../utils/coordinates').Area} [frames]
 * @param {boolean} [loop]
 */
const createSprite = async (image, options) => {
  const texture = await Assets.load(image);
  if (!options || !options.frames || options.frames.length === 0) {
    return Sprite.from(texture);
  }
  const sheet = {
    frames: options.frames.reduce((acc, frame) => ({
      ...acc,
      [getFrameId()]: {
        frame,
      },
    }), {}),
    meta: {
      scale: '1',
    },
  };
  await new Spritesheet(texture, sheet).parse();
  const textures = Object.keys(sheet.frames).map((key) => Texture.from(key));
  if (options.frames.length === 1) {
    return new Sprite(textures[0]);
  }
  const sp = new AnimatedSprite(textures);
  sp.loop = options.loop ?? true;
  return sp;
};

/**
 * @typedef {"up" | "down" | "left" | "right"} Direction
 */

/**
 * @typedef {Object} SpriteInfo
 * @property {string} [image]
 * @property {import('../../utils/coordinates').Area[]} [frames]
 * @property {import('../../utils/coordinates').Area} [hitbox]
 */

/**
 * @typedef MotionInfo
 * @property {string} [image]
 * @property {boolean} [loop]
 * @property {import('../../utils/coordinates').Area} [hitbox]
 * @property {SpriteInfo} [up]
 * @property {SpriteInfo} down
 * @property {SpriteInfo} [left]
 * @property {SpriteInfo} [right]
 */

/**
 * @typedef {Object} IObjectParameter
 * @property {string} [name]
 * @property {string} image
 * @property {Object<string, MotionInfo>} motions
 * @property {number} [z]
 */

class IObject {
  name;

  container = new Container();

  #loaded = false;

  #z;

  /**
   * @typedef {Object} Motion
   * @property {Sprite | AnimatedSprite | null} up
   * @property {Sprite | AnimatedSprite} down
   * @property {Sprite | AnimatedSprite | null} left
   * @property {Sprite | AnimatedSprite | null} right
   * @property {import('../../utils/coordinates').Area | undefined} hitbox
   */
  /** @type {{[key: string]: Motion | undefined}}>} */
  #motions = {};

  /** @type {Direction} */
  #dir = 'down';

  #motionKey = 'default';

  #p;

  /**
   * @param {IObjectParameter} p
   */
  constructor(p) {
    this.name = p.name || '(noname)';
    this.#p = p;
    this.#z = p.z ?? 1;
  }

  isLoaded() {
    return this.#loaded;
  }

  #getHitbox() {
    return this.#p.motions[this.#motionKey][this.#dir].hitbox
        || this.#p.motions[this.#motionKey].hitbox;
  }

  #getHitboxMod() {
    const hitbox = this.#getHitbox();
    if (!hitbox) {
      return { modX: 0, modY: 0 };
    }
    return {
      modX: hitbox.x,
      modY: hitbox.y,
    };
  }

  /**
   * @param {string} [motionKey]
   * @returns
   */
  #getMotion(motionKey) {
    const key = motionKey ?? this.#motionKey;
    const motion = this.#motions[key];
    if (!motion) {
      throw this.#error(`No "${key}" motion.`);
    }
    return motion;
  }

  /**
   * @param {Direction} [dir]
   */
  #getSprite(dir) {
    const d = dir ?? this.#dir;
    const sprite = this.#getMotion()[d];
    if (!sprite) {
      throw this.#error(`No "${d}" sprite.`);
    }
    return sprite;
  }

  async load() {
    if (this.#loaded) {
      return;
    }
    const promiseList = Object.keys(this.#p.motions)
      .map(async (motionKey) => {
        const {
          up, down, left, right, image, loop, hitbox,
        } = this.#p.motions[motionKey];
        const defaultImage = image ?? this.#p.image;
        const [
          upSprite,
          downSprite,
          leftSprite,
          rightSprite,
        ] = await Promise.all([
          up
            ? await createSprite(up.image ?? defaultImage, { frames: up.frames, loop })
            : Promise.resolve(null),
          await createSprite(down.image ?? defaultImage, { frames: down.frames, loop }),
          left
            ? await createSprite(left.image ?? defaultImage, { frames: left.frames, loop })
            : Promise.resolve(null),
          right
            ? await createSprite(right.image ?? defaultImage, { frames: right.frames, loop })
            : Promise.resolve(null),
        ]);
        this.#motions[motionKey] = {
          up: upSprite,
          down: downSprite,
          left: leftSprite,
          right: rightSprite,
          hitbox,
        };
      });
    await Promise.all(promiseList);

    this.container.addChild(this.#getSprite());
    this.#loaded = true;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} [z]
   */
  setPosition(x, y, z) {
    const { modX, modY } = this.#getHitboxMod();
    this.container.x = x - modX;
    this.container.y = y - modY;
    if (typeof z === 'number') {
      this.#z = z;
    }
    this.container.zIndex = this.#z * Z_INDEX_MOD + y;
  }

  getPosition() {
    const { modX, modY } = this.#getHitboxMod();
    return {
      x: this.container.x + modX,
      y: this.container.y + modY,
      z: this.#z,
    };
  }

  getWidth() {
    const { hitbox } = this.#getMotion();
    if (hitbox) {
      return hitbox.w;
    }
    const { frames } = this.#p.motions[this.#motionKey][this.#dir];

    if (frames.length > 0) {
      return frames[0].w;
    }
    if (this.isLoaded()) {
      return this.container.width;
    }
    throw this.#error('fail to get size. not loaded and no size value in constructor parameter.');
  }

  getHeight() {
    const { hitbox } = this.#getMotion();
    if (hitbox) {
      return hitbox.h;
    }
    const { frames } = this.#p.motions[this.#motionKey][this.#dir];

    if (frames.length > 0) {
      return frames[0].h;
    }
    if (this.isLoaded()) {
      return this.container.height;
    }
    throw this.#error('fail to get size. not loaded and no size value in constructor parameter.');
  }

  getArea() {
    const { x, y, z } = this.getPosition();
    const w = this.getWidth();
    const h = this.getHeight();
    return {
      x, y, z, w, h,
    };
  }

  getCenterPosition() {
    const { x, y } = this.getPosition();
    return { x: x + this.getWidth() / 2, y: y + this.getHeight() / 2 };
  }

  /**
   * @param {Object} [options]
   * @param {number} [options.speed]
   * @param {(frameIndex: number) => void} [options.onFrameChange]
   * @param {(frameIndex: number) => void} [options.onComplete]
   */
  play(options) {
    if (!this.isLoaded()) {
      throw this.#error('not loaded.');
    }
    const sprite = this.#getSprite();
    if (!(sprite instanceof AnimatedSprite)) {
      return;
    }
    const speed = options?.speed || 1;
    sprite.animationSpeed = speed * DEFAULT_ANIMATION_SPEED;
    sprite.onFrameChange = options?.onFrameChange;
    if (sprite.loop) {
      sprite.play();
    } else {
      sprite.gotoAndPlay(0);
      sprite.onComplete = options?.onComplete;
    }
  }

  stop() {
    const sprite = this.#getSprite();
    if (!(sprite instanceof AnimatedSprite)) {
      return;
    }
    sprite.stop();
  }

  /**
   * @param {Direction} next
   */
  setDirection(next) {
    if (!this.isLoaded()) {
      this.#dir = next;
      return;
    }
    const lastSprite = this.#getSprite();
    const isPlaying = lastSprite.playing;

    this.stop();
    this.#dir = next;

    this.container.removeChild(lastSprite);
    this.container.addChild(this.#getSprite());
    if (isPlaying) {
      this.play();
    }
  }

  getDirection() {
    return this.#dir;
  }

  /**
   * @param {string} next
   */
  changeMotion(next) {
    this.container.removeChild(this.#getSprite());
    this.#motionKey = next;
    this.container.addChild(this.#getSprite());
  }

  #error(msg) {
    return new Error(`[IObject:${this.name}] ${msg}`);
  }
}

export default IObject;
