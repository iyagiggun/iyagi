// eslint-disable-next-line max-classes-per-file
import {
  AnimatedSprite,
  Assets, Container, Sprite, Spritesheet, Texture,
} from 'pixi.js';
import { FRAMES_PER_SECOND } from '../const';
import { IObjectEvent } from './event';

/**
 * @typedef {"up" | "down" | "left" | "right"} Direction
 */

/**
 * @typedef SpriteImage
 * @property {string} url
 * @property {number} [scale]
 */

const Z_INDEX_MOD = 10000;
const DEFAULT_ANIMATION_SPEED = 6 / FRAMES_PER_SECOND; // 10 fps

let frame_idx = 0;

const get_frame_id = () => {
  frame_idx += 1;
  return `iyagi:isprite:frame:${frame_idx}`;
};

/**
 * @param {SpriteImage} image
 * @param {Object} options
 * @param {import('../utils/coordinates').Area[]} [options.frames]
 * @param {boolean} [options.loop]
 * @param {boolean} [options.scale]
 */
const create_sprite = async (image, options) => {
  const texture = await Assets.load(image.url);
  if (!options || !options.frames || options.frames.length === 0) {
    return Sprite.from(texture);
  }
  const sheet = {
    frames: options.frames.reduce((acc, frame) => ({
      ...acc,
      [get_frame_id()]: {
        frame,
      },
    }), {}),
    meta: {
      scale: image.scale ?? 1,
    },
  };
  // @ts-ignore
  await new Spritesheet(texture, sheet).parse();
  const textures = Object.keys(sheet.frames).map((key) => Texture.from(key));
  if (options.frames.length === 1) {
    return new Sprite(textures[0]);
  }
  const sp = new AnimatedSprite(textures);
  sp.loop = options.loop ?? true;
  sp.animationSpeed = 1 * DEFAULT_ANIMATION_SPEED;
  return sp;
};

/**
 * @typedef {Object} SpriteInfo
 * @property {SpriteImage} [image]
 * @property {import('../utils/coordinates').Area[]} [frames]
 * @property {import('../utils/coordinates').Area} [hitbox]
 */

/**
 * @typedef MotionInfo
 * @property {SpriteImage} [image]
 * @property {boolean} [loop]
 * @property {import('../utils/coordinates').Area} [hitbox]
 * @property {SpriteInfo} [up]
 * @property {SpriteInfo} [down]
 * @property {SpriteInfo} [left]
 * @property {SpriteInfo} [right]
 */

/**
 * @typedef {Object} ObjectParameter
 * @property {string} [name]
 * @property {SpriteImage} image
 * @property {Object<string, MotionInfo>} motions
 * @property {number} [z]
 */

/**
 * @param {string} msg
 * @param {string} name
 * @returns
 */
const create_error = (msg, name) => new Error(`[iyagi:object${name ? `:${name}` : ''}] ${msg}`);

/**
 * @typedef MonoParameter
 * @property {SpriteImage} image
 * @property {string} [name]
 * @property {import('../utils/coordinates').Area[]} [frames]
 * @property {import('../utils/coordinates').Area} [hitbox]
 * @property {number} [z]
 */

class IObject {
  name;

  /** @type {import('../scene').IScene | null} */
  scene = null;

  container = new Container();

  event = new IObjectEvent(this);

  #loaded = false;

  #motion = 'default';

  /** @type {Direction} */
  #dir = 'down';

  #z;

  /** @type {null | (() => Promise<void>)} */
  interaction = null;

  /**
   * @typedef {Object} Motion
   * @property {Sprite | AnimatedSprite | null} up
   * @property {Sprite | AnimatedSprite | null} down
   * @property {Sprite | AnimatedSprite | null} left
   * @property {Sprite | AnimatedSprite | null} right
   * @property {import('../utils/coordinates').Area | undefined} hitbox
   */
  /**
   * @type {Object.<string, Motion|undefined>}
   */
  #motions = {};

  /** @type {ObjectParameter} */
  #p;

  /**
   * @param {ObjectParameter} p
   */
  constructor(p) {
    this.name = p.name ?? '(none)';
    this.#p = p;
    this.#z = p.z ?? 1;
  }

  #get_scale() {
    return this.#p.motions[this.#motion][this.#dir]?.image?.scale
        ?? this.#p.motions[this.#motion].image?.scale
        ?? this.#p.image.scale
        ?? 1;
  }

  #get_hitbox() {
    return this.#p.motions[this.#motion][this.#dir]?.hitbox ?? this.#p.motions[this.#motion].hitbox;
  }

  #get_mod = () => {
    const hitbox = this.#get_hitbox();
    if (!hitbox) {
      return {
        modX: 0,
        modY: 0,
      };
    }
    const scale = this.#get_scale();
    return {
      modX: hitbox.x / scale,
      modY: hitbox.y / scale,
    };
  };

  /**
   * @param {string} [key]
   */
  #get_motion(key) {
    const value = this.#motions[key ?? this.#motion];
    if (!value) {
      throw create_error(`No "${key}" motion.`, this.name);
    }
    return value;
  }

  /**
   * @param {Direction} [dir]
   */
  #get_sprite(dir) {
    const d = dir ?? this.#dir;
    // const sprite = this.#get_motion()[d];
    const sprite = this.#motions[this.#motion]?.[d];
    if (!sprite) {
      throw create_error(`No "${d}" sprite.`, this.name);
    }
    return sprite;
  }

  application() {
    if (!this.scene) {
      throw new Error('No scene.');
    }
    return this.scene.application();
  }

  async load() {
    if (this.#loaded) {
      return;
    }
    const promises = Object.keys(this.#p.motions)
      .map(async (key) => {
        const {
          up, down, left, right, image, loop, hitbox,
        } = this.#p.motions[key];

        const default_image = image ?? this.#p.image;
        const [
          up_sprite,
          down_sprite,
          left_sprite,
          right_sprite,
        ] = await Promise.all([
          up
            ? await create_sprite(up.image ?? default_image, {
              frames: up.frames,
              loop,
            })
            : Promise.resolve(null),
          down
            ? await create_sprite(down.image ?? default_image, {
              frames: down.frames,
              loop,
            })
            : Promise.resolve(null),
          left
            ? await create_sprite(left.image ?? default_image, {
              frames: left.frames,
              loop,
            })
            : Promise.resolve(null),
          right
            ? await create_sprite(right.image ?? default_image, {
              frames: right.frames,
              loop,
            })
            : Promise.resolve(null),
        ]);

        this.#motions[key] = {
          up: up_sprite,
          down: down_sprite,
          left: left_sprite,
          right: right_sprite,
          hitbox,
        };

        if (!down) {
          if (up) {
            this.#dir = 'up';
          }
          if (left) {
            this.#dir = 'left';
          }
          if (right) {
            this.#dir = 'right';
          }
        }
      });
    await Promise.all(promises);

    this.container.addChild(this.#get_sprite());
    this.#loaded = true;
  }

  isLoaded() {
    return this.#loaded;
  }

  /**
   * @param {{x?: number, y?: number, z?: number}} pos
   */
  set xyz({ x, y, z }) {
    const { modX, modY } = this.#get_mod();
    if (typeof x === 'number') {
      this.container.x = x - modX;
    }
    const yIsNumber = typeof y === 'number';
    if (yIsNumber) {
      this.container.y = y - modY;
    }
    const zIsNumber = typeof z === 'number';
    if (zIsNumber) {
      this.#z = z;
    }
    if (yIsNumber || zIsNumber) {
      this.container.zIndex = this.#z * Z_INDEX_MOD + this.container.y + modY;
    }
  }

  /**
   * @return {{ x: number, y: number, z: number}}
   */
  get xyz() {
    const {
      modX,
      modY,
    } = this.#get_mod();
    return {
      x: this.container.x + modX,
      y: this.container.y + modY,
      z: this.#z,
    };
  }

  /**
   * @param {{x? : number, y?: number}} xy
   */
  set xy({ x, y }) {
    const { modX, modY } = this.#get_mod();
    if (typeof x === 'number') {
      this.container.x = x - modX;
    }
    if (typeof y === 'number') {
      this.container.y = y - modY;
      this.container.zIndex = this.#z * Z_INDEX_MOD + this.container.y + modY;
    }
  }

  /**
   * @return {{ x: number, y: number }}
   */
  get xy() {
    const { x, y } = this.xyz;
    return { x, y };
  }

  /**
   * @param {number} x
   */
  set x(x) {
    this.xy = { x };
  }

  get x() {
    return this.xyz.x;
  }

  /**
   * @param {number} y
   */
  set y(y) {
    this.xy = { y };
  }

  get y() {
    return this.xyz.y;
  }

  /**
   * @param {number} z
   */
  set z(z) {
    this.xyz = { z };
  }

  get z() {
    return this.#z;
  }

  width() {
    const hitbox = this.#get_hitbox();
    const frame = this.#p.motions[this.#motion][this.#dir]?.frames?.[0];
    if (!frame) {
      throw new Error('No frame');
    }
    return hitbox?.w ?? frame.w;
  }

  height() {
    const hitbox = this.#get_hitbox();
    const frame = this.#p.motions[this.#motion][this.#dir]?.frames?.[0];
    if (!frame) {
      throw new Error('No frame');
    }
    return hitbox?.h ?? frame.h;
  }

  /**
   * @param {Direction} next
   */
  direct(next) {
    if (!this.#loaded) {
      this.#dir = next;
      return;
    }
    if (this.#dir === next) {
      return;
    }
    const last_sprite = this.#get_sprite();
    const is_playing = last_sprite instanceof AnimatedSprite ? last_sprite.playing : false;

    this.stop();
    this.#dir = next;

    this.container.removeChild(last_sprite);
    this.container.addChild(this.#get_sprite());

    if (is_playing) {
      this.play();
    }
  }

  direction() {
    return this.#dir;
  }

  /**
   * @param {string} motion
   */
  change(motion) {
    this.container.removeChild(this.#get_sprite());
    // TODO:: param check
    this.#motion = motion;
    this.container.addChild(this.#get_sprite());
  }
  // doing() {
  //   return motion;
  // },

  area() {
    const { x, y, z } = this.xyz;
    const hitbox = this.#get_hitbox();
    const frame = this.#p.motions[this.#motion][this.#dir]?.frames?.[0]
    ?? this.#p.motions[this.#motion][this.#dir]?.frames?.[0];
    if (!frame) {
      throw new Error('No frame');
    }

    return {
      x,
      y,
      z,
      w: hitbox?.w ?? frame.w,
      h: hitbox?.h ?? frame.h,
    };
  }

  center() {
    const {
      x, y, w, h,
    } = this.area();

    return {
      x: x + w / 2,
      y: y + h / 2,
    };
  }

  /**
   * @param {Object} [options]
   * @param {number} [options.speed]
   * @param {(frameIndex: number) => void} [options.onFrameChange]
   * @param {(frameIndex: number) => void} [options.onComplete]
   */
  play(options) {
    if (!this.#loaded) {
      throw create_error('fail to play. not loaded', this.name);
    }
    const sprite = this.#get_sprite();
    if (!(sprite instanceof AnimatedSprite)) {
      return;
    }
    if (options?.speed) {
      sprite.animationSpeed = options.speed * DEFAULT_ANIMATION_SPEED;
    }
    sprite.onFrameChange = options?.onFrameChange;
    if (sprite.loop) {
      sprite.play();
    } else {
      sprite.gotoAndPlay(0);
      // TODO ::
      sprite.onComplete = () => options?.onComplete?.(1);
    }
  }

  stop() {
    const sprite = this.#get_sprite();
    if (!(sprite instanceof AnimatedSprite)) {
      return;
    }
    sprite.stop();
  }

  hide() {
    this.container.visible = false;
  }

  show() {
    this.container.visible = true;
  }
}

class IObjectMono extends IObject {
  /**
   * @param {MonoParameter} p
   * @returns
   */
  constructor({
    name, image, frames, hitbox, z,
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
      z,
    });
  }
}

export { IObject, IObjectMono };
