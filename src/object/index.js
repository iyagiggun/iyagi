import {
  AnimatedSprite, BaseTexture, Container, Sprite, Spritesheet, Texture,
} from 'pixi.js';
import { FRAMES_PER_SECOND } from '../const';

const DEFAULT_ANIMATION_SPEED = 6 / FRAMES_PER_SECOND; // 10 fps
const Z_INDEX_MOD = 10000;
/**
 * @type {Object.<string, import("pixi.js").BaseTexture>}
 */
const TEXTURE_CACHE_MAP = {};

/**
 * @param {string} imgUrl
 */
const getTexture = (imgUrl) => {
  if (!TEXTURE_CACHE_MAP[imgUrl]) {
    TEXTURE_CACHE_MAP[imgUrl] = BaseTexture.from(imgUrl);
  }
  return TEXTURE_CACHE_MAP[imgUrl];
};

/**
 * @typedef {'up' | 'down' | 'left' | 'right'} Direction
 */

/**
 * @typedef {Object} SpriteInfo
 * @property {import('../utils/coordinates').Area[]} areaList
 * @property {import('../utils/coordinates').Area} collision
 */

/**
 * @typedef {Object} MotionInfo
 * @property {SpriteInfo} [up]
 * @property {SpriteInfo} down
 * @property {SpriteInfo} [left]
 * @property {SpriteInfo} [right]
 * @property {boolean} [loop]
 */

/**
 * @typedef {Object} IObjectParameter
 * @property {string} [name]
 * @property {Object} sprite
 * @property {string} sprite.url
 * @property {Object<string, MotionInfo>} sprite.motions
 * @property {number} [z]
 */

/**
 * @typedef {ReturnType<typeof IObject.create>} IObjectCreated
 */

const IObject = {
  /**
   * @param {IObjectParameter} p
   */
  create: (p) => {
    const { name } = p;

    const container = new Container();

    let loaded = false;

    const { motions } = p.sprite;

    let curMotionKey = 'default';
    /**
     * @type {import("pixi.js").Sprite | undefined}
     */
    let curSprite;
    /**
     * @type {Direction}
     */
    let curDirection = 'down';
    /**
     * @type {number}
     */
    let z = p.z ?? 1;
    /**
     * @type {Object.<string,import("pixi.js").Sprite>}
     */
    const SPRITE_CACHE_MAP = {};

    /**
     * @param {string} [_key]
     * @param {Direction} [_dir]
     */
    const getMotionInfo = (_key, _dir) => {
      const key = _key ?? curMotionKey;
      const dir = _dir ?? curDirection;
      const info = motions[key][dir];
      if (!info) {
        throw new Error(`[object.getMotionInfo] no motion info. ${name}:${curMotionKey}:${curDirection}`);
      }
      return info;
    };

    /**
     * @param {string} key
     * @param {Direction} dir
     * @returns
     */
    const getFrames = (key, dir) => getMotionInfo(key, dir).areaList.map((area, idx) => ({
      key: `${name}:${key}:${dir}:${idx}`,
      frame: area,
    }));

    /**
     * @param {string} [motionKey]
     * @param {Direction} [dir]
     * @returns
     */
    const getMotionSprite = (motionKey, dir) => {
      const frames = getFrames(motionKey ?? curMotionKey, dir ?? curDirection);
      const key = frames.map((f) => f.key).join(',');
      if (!SPRITE_CACHE_MAP[key]) {
        if (frames.length === 1) {
          SPRITE_CACHE_MAP[key] = Sprite.from(frames[0].key);
        } else {
          const info = motions[motionKey ?? curMotionKey];
          const sprite = new AnimatedSprite(frames.map((frame) => Texture.from(frame.key)));
          sprite.loop = info.loop ?? true;
          SPRITE_CACHE_MAP[key] = sprite;
        }
      }
      return SPRITE_CACHE_MAP[key];
    };

    const retObj = {
      name,
      container,
      isLoaded: () => loaded,
      load: () => {
        if (loaded) {
          return Promise.resolve();
        }
        const data = Object.keys(motions)
          .map((motionKey) => {
            const frames = Object.keys(motions[motionKey])
              .map((dir) => {
                switch (dir) {
                  case 'up':
                  case 'down':
                  case 'left':
                  case 'right':
                    return getFrames(motionKey, dir);
                  default:
                    return [];
                }
              });
            return frames;
          })
          .flatMap((x) => x)
          .reduce((acc, eachFrame) => ({
            ...acc,
            frames: {
              ...acc.frames,
              ...eachFrame.reduce((eachAcc, info) => ({
                ...eachAcc,
                [`${info.key}`]: {
                  frame: info.frame,
                },
              }), {}),
            },
          }), {
            frames: {},
            meta: {
              scale: '1',
            },
          });

        const sheet = new Spritesheet(getTexture(p.sprite.url), data);
        return sheet.parse().then(() => {
          loaded = true;
          retObj.setDirection(curDirection);
        });
      },
      /**
       * @param {Direction} next
       */
      setDirection: (next) => {
        if (!loaded) {
          curDirection = next;
          return;
        }
        if (curDirection === next && curSprite) {
          return;
        }
        if (curSprite) {
          retObj.stop();
          container.removeChild(curSprite);
        }
        curDirection = next;
        curSprite = getMotionSprite();
        container.addChild(curSprite);
      },
      getDirection: () => curDirection,

      getWidth: () => {
        const info = getMotionInfo();
        const { collision } = info;
        if (collision) {
          return collision.w;
        }
        return info.areaList[0].w;
      },
      getHeight: () => {
        const info = getMotionInfo();
        const { collision } = info;
        if (collision) {
          return collision.h;
        }
        return info.areaList[0].h;
      },
      getPosition: () => {
        const { modX, modY } = retObj.getCollisionMod();
        return {
          x: container.x + modX,
          y: container.y + modY,
          z,
        };
      },
      /**
       * @param {number} x
       * @param {number} y
       * @param {number} [_z]
       */
      setPosition: (x, y, _z) => {
        const { modX, modY } = retObj.getCollisionMod();
        container.x = x - modX;
        container.y = y - modY;
        if (_z !== undefined) {
          z = _z;
        }
        container.zIndex = z * Z_INDEX_MOD + y;
      },
      getArea: () => {
        const { x, y, z: _z } = retObj.getPosition();
        const w = retObj.getWidth();
        const h = retObj.getHeight();
        return {
          x, y, z: _z, w, h,
        };
      },
      getCollisionMod: () => {
        const info = motions[curMotionKey][curDirection];
        if (!info) {
          throw new Error(`[Object.getCollisionMod] no sprite info. ${name}:${curMotionKey}:${curDirection}`);
        }
        if (info.collision) {
          return { modX: info.collision.x, modY: info.collision.y };
        }
        return { modX: 0, modY: 0 };
      },
      getCenterPosition: () => {
        const { x, y } = retObj.getPosition();
        return { x: x + retObj.getWidth() / 2, y: y + retObj.getHeight() / 2 };
      },
      /**
       * @param {string} next
       */
      changeMotion: (next) => {
        if (!Object.prototype.hasOwnProperty.call(motions, next)) {
          throw new Error(`[object.changeMotion] "${name}" does not have sprite ${next}.`);
        }
        if (curSprite) {
          retObj.stop();
          container.removeChild(curSprite);
        }
        curMotionKey = next;
        curSprite = getMotionSprite();
        container.addChild(curSprite);
      },
      /**
       * @param {Object} [options]
       * @param {number} [options.speed]
       * @param {(frameIndex: number) => void} [options.onFrameChange]
       */
      play: (options) => {
        if (!loaded) {
          throw new Error(`"${name}" is not loaded.`);
        }
        const speed = options?.speed || 1;
        if (curSprite && curSprite instanceof AnimatedSprite && !curSprite.playing) {
          curSprite.animationSpeed = speed * DEFAULT_ANIMATION_SPEED;
          curSprite.onFrameChange = options?.onFrameChange;
          if (curSprite.loop) {
            curSprite.play();
          } else {
            curSprite.gotoAndPlay(0);
            curSprite.onComplete = () => {
              retObj.changeMotion('default');
            };
          }
        }
      },
      stop: () => {
        if (curSprite instanceof AnimatedSprite && curSprite.playing) {
          curSprite.stop();
        }
      },
    };

    return Object.freeze(retObj);
  },
};

export default IObject;
