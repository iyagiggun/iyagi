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

const IObject = {
  /**
   * @param {import('./type').IObjectParameter} p
   */
  create: (p) => {
    const { name } = p;
    const container = new Container();
    let loaded = false;

    const { actions } = p.sprite;

    let curActionKey = 'default';
    /**
     * @type {import("pixi.js").Sprite | undefined}
     */
    let curSprite;
    /**
     * @type {import('./type').Direction}
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
     * @param {import('./type').Direction} [_dir]
     */
    const getActionInfo = (_key, _dir) => {
      const key = _key ?? curActionKey;
      const dir = _dir ?? curDirection;
      const info = actions[key][dir];
      if (!info) {
        throw new Error(`[object.getActionInfo] no action info. ${name}:${curActionKey}:${curDirection}`);
      }
      return info;
    };

    /**
     * @param {string} key
     * @param {import('./type').Direction} dir
     * @returns
     */
    const getFrames = (key, dir) => getActionInfo(key, dir).areaList.map((area, idx) => ({
      key: `${name}:${key}:${dir}:${idx}`,
      frame: area,
    }));

    /**
     * @param {string} [actionKey]
     * @param {import('./type').Direction} [dir]
     * @returns
     */
    const getActionSprite = (actionKey, dir) => {
      const frames = getFrames(actionKey ?? curActionKey, dir ?? curDirection);
      const key = frames.map((f) => f.key).join(',');
      if (!SPRITE_CACHE_MAP[key]) {
        if (frames.length === 1) {
          SPRITE_CACHE_MAP[key] = Sprite.from(frames[0].key);
        } else {
          const info = actions[actionKey ?? curActionKey];
          const sprite = new AnimatedSprite(frames.map((frame) => Texture.from(frame.key)));
          sprite.loop = info.loop ?? true;
          sprite.onFrameChange = info.onAction;
          // animated_sprite.onFrameChange = onFrameChange;
          SPRITE_CACHE_MAP[key] = sprite;
        }
      }
      return SPRITE_CACHE_MAP[key];
    };

    const getCollisionMod = () => {
      const info = actions[curActionKey][curDirection];
      if (!info) {
        throw new Error(`[Object.getCollisionMod] no sprite info. ${name}:${curActionKey}:${curDirection}`);
      }
      if (info.collision) {
        return { modX: info.collision.x, modY: info.collision.y };
      }
      return { modX: 0, modY: 0 };
    };

    const stop = () => {
      if (curSprite instanceof AnimatedSprite && curSprite.playing) {
        curSprite.stop();
      }
    };

    /**
     * @param {string} next
     */
    const action = (next) => {
      if (!Object.prototype.hasOwnProperty.call(actions, next)) {
        throw new Error(`[object.action] "${name}" does not have sprite ${next}.`);
      }
      if (curSprite) {
        stop();
        container.removeChild(curSprite);
      }
      curActionKey = next;
      curSprite = getActionSprite();
      container.addChild(curSprite);
    };

    const play = (speed = 1) => {
      if (!loaded) {
        throw new Error(`"${name}" is not loaded.`);
      }
      if (curSprite && curSprite instanceof AnimatedSprite && !curSprite.playing) {
        curSprite.animationSpeed = speed * DEFAULT_ANIMATION_SPEED;
        if (curSprite.loop) {
          curSprite.play();
        } else {
          curSprite.gotoAndPlay(0);
          curSprite.onComplete = () => {
            action('default');
          };
        }
      }
    };

    /**
     * @param {import('./type').Direction} next
     */
    const setDirection = (next) => {
      if (!loaded) {
        curDirection = next;
        return;
      }
      if (curDirection === next && curSprite) {
        return;
      }
      if (curSprite) {
        stop();
        container.removeChild(curSprite);
      }
      curDirection = next;
      curSprite = getActionSprite();
      container.addChild(curSprite);
    };

    const isLoaded = () => loaded;

    const load = () => {
      if (loaded) {
        return Promise.resolve();
      }
      const data = Object.keys(actions)
        .map((actionKey) => {
          const frames = Object.keys(actions[actionKey])
            .map((dir) => {
              switch (dir) {
                case 'up':
                case 'down':
                case 'left':
                case 'right':
                  return getFrames(actionKey, dir);
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
        setDirection(curDirection);
      });
    };

    const getPosition = () => {
      const { modX, modY } = getCollisionMod();
      return {
        x: container.x + modX,
        y: container.y + modY,
        z,
      };
    };

    const getWidth = () => {
      const info = getActionInfo();
      const { collision } = info;
      if (collision) {
        return collision.w;
      }
      return info.areaList[0].w;
    };

    const getHeight = () => {
      const info = getActionInfo();
      const { collision } = info;
      if (collision) {
        return collision.h;
      }
      return info.areaList[0].h;
    };

    const getArea = () => {
      const { x, y, z: _z } = getPosition();
      const w = getWidth();
      const h = getHeight();
      return {
        x, y, z: _z, w, h,
      };
    };

    /**
   * @param {number} x
   * @param {number} y
   * @param {number} [_z]
   */
    const setPosition = (x, y, _z) => {
      const { modX, modY } = getCollisionMod();
      container.x = x - modX;
      container.y = y - modY;
      if (_z !== undefined) {
        z = _z;
      }
      container.zIndex = z * Z_INDEX_MOD + y;
    };

    const getCenterPosition = () => {
      const { x, y } = getPosition();
      return { x: x + getWidth() / 2, y: y + getHeight() / 2 };
    };

    return Object.freeze({
      name,
      container,
      isLoaded,
      load,
      setDirection,
      getWidth,
      getHeight,
      getPosition,
      setPosition,
      getArea,
      getCollisionMod,
      getCenterPosition,
      action,
      play,
      stop,
    });
  },
};

export default IObject;
