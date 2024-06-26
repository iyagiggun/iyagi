// eslint-disable-next-line max-classes-per-file
import {
  AnimatedSprite,
  Assets, Container, EventEmitter, Sprite, Spritesheet,
} from 'pixi.js';
import { FRAMES_PER_SECOND } from '../const';
import IObjectEventManager from './event';

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
 *
 * @param {Sprite | AnimatedSprite} sprite
 * @returns
 */
const getFlipHorizontal = (sprite) => {
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
  const parsed = await new Spritesheet(texture, sheet).parse();
  const textures = Object.values(parsed);
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

class IObject extends EventEmitter {
  name;

  /** @type {import('../scene').IScene | null} */
  scene = null;

  container = new Container();

  #loaded = false;

  #motion = 'default';

  /** @type {Direction} */
  #dir = 'down';

  #z;

  #event_manager = new IObjectEventManager(this);

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
    super();
    this.name = p.name ?? '(none)';
    this.#p = p;
    this.#z = p.z ?? 1;
    this.#event_manager.activate();
    // this.eventable = p.eventable ?? false;
  }

  #get_scale() {
    return this.#p.motions[this.#motion][this.#dir]?.image?.scale
        ?? this.#p.motions[this.#motion].image?.scale
        ?? this.#p.image.scale
        ?? 1;
  }

  #get_hitbox() {
    const inDirection = this.#p.motions[this.#motion][this.#dir]?.hitbox;
    if (inDirection) {
      return inDirection;
    }
    const opposition = (() => {
      switch (this.#dir) {
        case 'left':
          return this.#p.motions[this.#motion].right;
        case 'right':
          return this.#p.motions[this.#motion].left;
        default:
          return null;
      }
    })();

    if (opposition) {
      const frameWidth = opposition.frames?.[0].w;
      const oHitbox = opposition.hitbox;
      if (frameWidth && oHitbox) {
        return {
          ...oHitbox,
          x: frameWidth - oHitbox.x - oHitbox.w,
        };
      }
    }

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

  get application() {
    if (!this.scene) {
      throw new Error('No scene.');
    }
    return this.scene.application;
  }

  // eslint-disable-next-line class-methods-use-this
  set application(_) {
    throw new Error('application is readonly');
  }

  async load() {
    if (this.#loaded) {
      return;
    }
    const promises = Object.keys(this.#p.motions)
      .map(async (motion) => {
        const {
          up, down, left, right, image, loop, hitbox,
        } = this.#p.motions[motion];

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

        const right_if_left = left_sprite ? getFlipHorizontal(left_sprite) : null;
        const left_if_right = right_sprite ? getFlipHorizontal(right_sprite) : null;

        this.#motions[motion] = {
          up: up_sprite,
          down: down_sprite,
          left: left_sprite ?? left_if_right,
          right: right_sprite ?? right_if_left,
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
    if (hitbox) {
      return hitbox.w;
    }
    const frame = this.#p.motions[this.#motion][this.#dir]?.frames?.[0];
    if (!frame) {
      throw new Error('No frame');
    }
    return frame.w;
  }

  height() {
    const hitbox = this.#get_hitbox();
    if (hitbox) {
      return hitbox.h;
    }
    const frame = this.#p.motions[this.#motion][this.#dir]?.frames?.[0];
    if (!frame) {
      throw new Error('No frame');
    }
    return frame.h;
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
    const lastXY = this.xy;
    const last_sprite = this.#get_sprite();
    const is_playing = last_sprite instanceof AnimatedSprite ? last_sprite.playing : false;

    this.stop();
    this.#dir = next;

    this.container.removeChild(last_sprite);
    this.xy = lastXY; // for calc modX, modY
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
    const lastXY = this.xy;
    this.container.removeChild(this.#get_sprite());
    // TODO:: param check
    this.#motion = motion;
    this.xy = lastXY; // for calc modX, modY
    this.container.addChild(this.#get_sprite());
  }
  // doing() {
  //   return motion;
  // },

  area() {
    const { x, y, z } = this.xyz;
    const hitbox = this.#get_hitbox();
    if (hitbox) {
      return {
        x,
        y,
        z,
        w: hitbox.w,
        h: hitbox.h,
      };
    }
    const frame = this.#p.motions[this.#motion][this.#dir]?.frames?.[0]
    ?? this.#p.motions[this.#motion][this.#dir]?.frames?.[0];
    if (!frame) {
      throw new Error('No frame');
    }
    return {
      x,
      y,
      z,
      w: frame.w,
      h: frame.h,
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
   * @param {string} [options.motion]
   * @param {number} [options.speed]
   * @param {(frameIndex: number) => void} [options.onFrameChange]
   * @param {(frameIndex: number) => void} [options.onComplete]
   */
  play(options = {}) {
    if (!this.#loaded) {
      throw create_error('fail to play. not loaded', this.name);
    }
    const { motion } = options;
    if (motion) {
      this.change(motion);
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
      sprite.onComplete = () => {
        if (motion) {
          this.change('default');
        }
      };
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

  // get eventable() {
  //   return this.#event_manager.enable;
  // }

  /**
   * @param {boolean} e
   */
  // set eventable(e) {
  //   if (e) {
  //     this.#event_manager.activate();
  //   } else {
  //     this.#event_manager.disactivate();
  //   }
  // }

  /**
   * @param {string | symbol} type
   * @param {any} data
   */
  emit(type, data) {
    if (!this.#event_manager.enable) {
      throw new Error('this is not eventable.');
    }
    return super.emit(type, data);
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
