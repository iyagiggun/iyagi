import { getMDKey } from './texture.js';
import { AnimatedSprite, Container, Graphics } from 'pixi.js';
import global from '../global/index.js';
import { FRAMES_PER_SECOND } from '../const/index.js';
import camera from '../camera/index.js';
import { Z_LAYER } from '@iyagi/commons/coords';

const DEFAULT_COMPLETE = () => undefined;

export const CLIENT_OBJECT_CONTAINER_LABEL = {
  SHADOW: 'shadow',
};

/**
 * @typedef {{
 *  id: string
 *  name?: string
 *  texture: import('./texture.js').default
 *  sprite: ReturnType<import('@iyagi/server/object/resource.js').ServerObjectResource['toClientData']>['sprite']
 *  portrait: import('./portrait.js').PortraitType
 * }} ClientObjectParams
 */

export default class ClientObject {

  /** @type {import('@iyagi/commons/coords').Direction} */
  #direction;

  #motion = 'base';

  #offset;

  #z = 0;

  #sprite;

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
    sprite,
  }) {
    this.container = new Container();
    this.id = id;
    this.name = name;
    this.#texture = texture;
    this.#direction = 'down';
    this.#portrait = portrait;
    this.#sprite = sprite;
    this.#offset = sprite.offset;
    this.set(this.#motion, this.#direction);

    if (sprite.shadow) {
      const shadow = new Graphics();
      shadow.label = CLIENT_OBJECT_CONTAINER_LABEL.SHADOW;
      shadow.ellipse(0, 0, sprite.shadow.w/2, sprite.shadow.h/2);
      shadow.fill({
        color: 0x000000,
        alpha: 0.4,
      });
      shadow.x = sprite.shadow.x + sprite.shadow.w/2;
      shadow.y = sprite.shadow.y + sprite.shadow.h/2;

      this.container.addChildAt(shadow, 0);
    }
  }

  load() {
    return this.#portrait.load();
  }

  /**
   * @param {string} motion
   * @param {import('@iyagi/commons/coords').Direction} [_direction]
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
    if (this.#sprite.motions?.[motion].playing) {
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

  #calcContainerZ() {
    this.container.zIndex = this.#z * Z_LAYER + this.container.y - this.#offset.y;
  }

  /**
   * @param {{x?: number, y?: number, z?: number}} xyz
   */
  set xyz({ x, y, z }) {
    if (typeof x === 'number') {
      this.container.x = x - this.#offset.x;
    }
    if (typeof y === 'number') {
      this.container.y = y - this.#offset.y;
      this.#calcContainerZ();
    }
    const nextZ = z ?? this.#z;
    if (nextZ !== this.#z) {
      this.#z = nextZ;
      this.#calcContainerZ();
    }
  }

  /**
   * @return {{ x: number, y: number, z: number }}
   */
  get xyz() {
    return {
      x: this.container.x + this.#offset.x,
      y: this.container.y + this.#offset.y,
      z: this.#z,
    };
  }

  /**
   * @param {import('@iyagi/commons/coords').Direction} dir
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
   * @param {import('@iyagi/commons/coords').XYZ & {
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
        const { x: curX, y: curY } = this.xyz;

        const diffX = x - curX;
        const diffY = y - curY;
        const distance = Math.hypot(diffX, diffY);

        const arrived = distance < speed || instant;

        if (arrived) {
          this.xyz = { x, y, z };
        } else {
          const deltaX = Math.round(speed * (diffX / distance));
          const deltaY = Math.round(speed * (diffY / distance));
          this.xyz = { x: curX + deltaX, y: curY + deltaY, z };
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
