import { getMDKey } from './texture.js';
import { AnimatedSprite, Container } from 'pixi.js';
import camera from '../camera/index.js';
import global from '../global/index.js';

/**
 * @typedef {import('pixi.js').Sprite} Sprite
 */

const DEFAULT_COMPLETE = () => undefined;

export default class ClientObject {

  /** @type {import('../../coords/index.js').Direction} */
  #direction;

  #motion = 'base';

  #info;

  #texture;

  #portrait;

  /** @type {Sprite | null} */
  #current = null;

  /**
   * @type {Map<string, Sprite>}
   */
  #cache = new Map();

  #complete = DEFAULT_COMPLETE;

  /**
   * @param {Object} param
   * @param {string} param.id
   * @param {string=} param.name
   * @param {import('./texture.js').default} param.texture
   * @param {import('./resource.js').SpriteInfo} param.info
   * @param {import('./portrait.js').PortraitType} param.portrait
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
  }

  /**
   * @param {string} motion
   * @param {import('../../coords/index.js').Direction} [_direction]
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
    if (this.#info.motions[motion].playing) {
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
   * @param {import('../../coords/index.js').Direction} dir
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
   * @param {import('../../coords/index.js').XYZ & {
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

      this.play();

      const tick = () => {
        const { x: curX, y: curY, z: curZ } = this.xyz;

        const diffX = x - curX;
        const diffY = y - curY;
        const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

        const arrived = distance < speed || instant;

        if (arrived) {
          this.xyz = { x, y, z };
        } else {
          const deltaX = Math.round(speed * (diffX / distance));
          const deltaY = Math.round(speed * (diffY / distance));
          this.xyz = { x: curX + deltaX, y: curY + deltaY, z: curZ + deltaY };
          camera.adjust({ x: deltaX, y: deltaY });
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
    return global.messenger.show({ name: this.name, message, portrait: this.#portrait.get(key) });
  }

  /**
   * @param {{
   *  speed?: number
   *  motion?: string
   * }} options
   */
  play({ speed, motion } = { speed: 1 }) {
    const before = this.#motion;

    if (motion) {
      this.set(motion);
    }

    const sprite = this.#current;
    if ((sprite instanceof AnimatedSprite) === false) {
      return;
    }

    // const speed = typeof _speed === 'number' ? _speed : _speed?.[0];
    // if (speed > 0) {
    //   sprite.animationSpeed = speed / FRAMES_PER_SECOND;
    // }

    if (!motion) {
      sprite.play();
      return;
    }

    sprite.onComplete = () => {
      this.set(before);
      if (this.#current instanceof AnimatedSprite) {
        this.#current.gotoAndStop(0);
      }
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
