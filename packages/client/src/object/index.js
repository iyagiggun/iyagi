import { getMDKey } from './texture.js';
import { AnimatedSprite, Container, Graphics } from 'pixi.js';
import global from '../global/index.js';
import { FRAMES_PER_SECOND } from '../const/index.js';
import camera from '../camera/index.js';

const DEFAULT_COMPLETE = () => undefined;

export const CLIENT_OBJECT_CONTAINER_LABEL = {
  SHADOW: 'shadow',
};

/**
 * @typedef {Object} ClientObjectParams
 * @property {string} id
 * @property {string=} name
 * @property {import('./texture.js').default} texture
 * @property {import('./resource.js').SpriteInfo} info
 * @property {import('./portrait.js').PortraitType} portrait
 */

export default class ClientObject {

  /** @type {import('@iyagi/commons').Direction} */
  #direction;

  #motion = 'base';

  #info;

  #texture;

  #portrait;

  /** @type {import('pixi.js').Sprite | null} */
  #current = null;

  /**
   * @type {Map<string, import('pixi.js').Sprite>}
   */
  #cache = new Map();

  #complete = DEFAULT_COMPLETE;

  /**
   * @param {ClientObjectParams} param
   */
  constructor({
    id,
    name,
    texture,
    portrait,
    info,
  }) {
    this.container = new Container();
    this.id = id;
    this.name = name;
    this.#texture = texture;
    this.#direction = 'down';
    this.#portrait = portrait;
    this.#info = info;
    this.set(this.#motion, this.#direction);

    if (this.#info.shadow) {
      const shadow = new Graphics();
      shadow.label = CLIENT_OBJECT_CONTAINER_LABEL.SHADOW;
      shadow.ellipse(0, 0, this.#info.shadow.w/2, this.#info.shadow.h/2);
      shadow.fill({
        color: 0x000000,
        alpha: 0.4,
      });
      shadow.x = this.#info.shadow.x + this.#info.shadow.w/2;
      shadow.y = this.#info.shadow.y + this.#info.shadow.h/2;

      this.container.addChildAt(shadow, 0);
    }
  }

  load() {
    return this.#portrait.load();
  }

  /**
   * @param {string} motion
   * @param {import('@iyagi/commons').Direction} [_direction]
   */
  set(motion, _direction) {
    const direction = _direction ?? this.#direction;
    const mdKey = getMDKey(motion, direction);
    const next = this.#cache.get(mdKey) ?? this.#texture.createSprite(motion, direction);
    if (!this.#cache.has(mdKey)) {
      this.#cache.set(mdKey, next);
    }
    if (next === this.#current) {
      return;
    };

    if (this.#current) {
      if (this.#current instanceof AnimatedSprite && next instanceof AnimatedSprite) {
        if (this.#current.playing) {
          this.#current.stop();
          next.play();
        }
      }
      this.container.removeChild(this.#current);
    }
    this.container.addChild(next);
    this.#current = next;
    if (this.#info.motions?.[motion].playing) {
      this.play();
    }
  }

  /**
   * @param {number} x
   */
  set x(x) {
    this.xyz = {
      x,
    };
  }

  /**
   * @param {number} y
   */
  set y(y) {
    this.xyz = {
      y,
    };
  }

  /**
   * @param {{x? : number, y?: number}} xy
   */
  set xy(xy) {
    this.xyz = {
      ...xy,
    };
  }

  /**
   * @return {{ x: number, y: number }};
   */
  get xy() {
    const { x, y } = this.xyz;
    return { x, y };
  }

  /**
   * @param {{x?: number, y?: number, z?: number}} xyz
   */
  set xyz({ x, y, z }) {
    if (typeof x === 'number') {
      this.container.x = x;
    }
    if (typeof y === 'number') {
      this.container.y = y;
    }
    if (typeof z === 'number') {
      this.container.zIndex = z;
    }
  }

  /**
   * @return {{ x: number, y: number, z: number }}
   */
  get xyz() {
    return {
      x: this.container.x,
      y: this.container.y,
      z: this.container.zIndex,
    };
  }

  /**
   * @param {import('@iyagi/commons').Direction} dir
   */
  set direction(dir) {
    switch (dir) {
      case 'up':
      case 'down':
      case 'left':
      case 'right':
        if (this.#direction === dir) {
          return;
        }
        this.#direction = dir;
        this.set(this.#motion, this.#direction);
        break;
      default:
        throw new Error(`Fail to change direction. Invalid value. value: ${dir}`);
    }
  }

  /**
   * @param {import('@iyagi/commons').XYZ & {
   *  speed?: number;
   *  instant: boolean;
   * }} p
   */
  move({
    x,
    y,
    z,
    speed: _speed,
    instant,
  }) {
    this.#complete();


    const speed = _speed ?? 1;
    return new Promise((resolve) => {

      this.play({ speed });

      const tick = () => {
        const { x: curX, y: curY, z: curZ } = this.xyz;

        const diffX = x - curX;
        const diffY = y - curY;
        const distance = Math.hypot(diffX, diffY);

        const arrived = distance < speed || instant;

        if (arrived) {
          this.xyz = { x, y, z };
        } else {
          const deltaX = Math.round(speed * (diffX / distance));
          const deltaY = Math.round(speed * (diffY / distance));
          this.xyz = { x: curX + deltaX, y: curY + deltaY, z: curZ + deltaY };
          if (camera.target === this) {
            camera.adjust({ x: deltaX, y: deltaY });
          }
          // if (camera) {
          //   camera.point(name);
          // }
          // scene.objects.move(this, { x: deltaX, y: deltaY });
          // const { camera } = scene;
          // if (options?.trace) {
          //   camera.point(this);
          // }
        }
        if (arrived) {
          this.#complete();
        }
      };

      this.#complete = () => {
        global.app.ticker.remove(tick);
        this.stop();
        this.#complete = DEFAULT_COMPLETE;
        // @ts-ignore
        resolve();
      };

      this.stop();
      this.play({
        speed,
      });
      global.app.ticker.add(tick);
    });
  }

  /**
   * @param {string | string[]} message
   * @param {string} [key]
   */
  talk(message, key) {
    if (!this.name) {
      throw new Error('Failed to talk. No name found.');
    }
    return global.messenger.show({ name: this.name, message, portrait: this.#portrait.get(key) });
  }

  /**
   * @param {{
   *  speed?: number
   *  motion?: string
   * }} options
   */
  play({ speed: _speed, motion } = {}) {
    const before = this.#motion;

    if (motion) {
      this.set(motion);
    }

    const sprite = this.#current;
    if ((sprite instanceof AnimatedSprite) === false) {
      return;
    }

    const speed = _speed ?? 1;
    if (speed > 0) {
      sprite.animationSpeed = speed * 10 / FRAMES_PER_SECOND;
    }

    if (!motion) {
      if (sprite.playing) {
        return;
      }
      sprite.play();
      return;
    }

    sprite.onComplete = () => {
      this.set(before);
      sprite.gotoAndStop(0);
      sprite.onComplete = DEFAULT_COMPLETE;
    };

    sprite.gotoAndPlay(0);
  }

  /**
   * @param {number=} frameIdx
   */
  stop(frameIdx) {
    if ((this.#current instanceof AnimatedSprite) === false) {
      return;
    }
    if (typeof frameIdx === 'number') {
      this.#current.gotoAndStop(frameIdx);
    } else {
      this.#current.stop();
    }
  }
}
