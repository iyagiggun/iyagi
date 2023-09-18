import { AnimatedSprite, BaseTexture, Container, Sprite, Spritesheet, Texture } from 'pixi.js';
import { Area, Direction } from '../utils/area';
import { FRAMES_PER_SECOND } from '../utils';

const DEFAULT_ANIMATION_SPEED = 6 / FRAMES_PER_SECOND; // 10 fps
const Z_INDEX_MOD = 10000;

const TEXTURE_CACHE_MAP: { [key: string] : BaseTexture } = {};

export type ObjectParams = {
  name: string;
  sprite: {
    url: string;
    motions: {
      default: DirectionalSpriteInfo;
      [key: string]: DirectionalSpriteInfo;
    }
  };
  z?: number;
}

export function createObject({
  name,
  sprite: {
    url,
    motions
  },
  z: _z
}: ObjectParams) {

  const container = new Container();

  let loaded = false;
  let curMotionKey = 'default';
  let curSprite: undefined | Sprite;
  let curDirection: Direction = 'down';
  let z = _z ?? 1;

  const SPRITE_CACHE_MAP: { [key: string]: Sprite } = {};

  const getMotionInfo = (_key?: string, _dir?: Direction) => {
    const key = _key ?? curMotionKey;
    const dir = _dir ?? curDirection;
    const info = motions[key][dir];
    if (!info) {
      throw new Error(`[object.getMotionInfo] no motion info. ${name}:${curMotionKey}:${curDirection}`);
    }
    return info;
  };

  const getFrames = (key: string, dir: Direction) => {
    return getMotionInfo(key, dir).areaList.map((area, idx) => ({
      key: `${name}:${key}:${dir}:${idx}`,
      frame: area
    }));
  };

  const getMotionSprite = (motionKey?: string, dir?:Direction) => {
    const frames = getFrames(motionKey ?? curMotionKey, dir ?? curDirection);
    const key = frames.map((f) => f.key).join(',');
    if (!SPRITE_CACHE_MAP[key]) {
      if (frames.length === 1) {
        SPRITE_CACHE_MAP[key] = Sprite.from(frames[0].key);
      } else {
        const sprite = new AnimatedSprite(frames.map((frame) => Texture.from(frame.key)));
        sprite.loop = true;
        // animated_sprite.onFrameChange = onFrameChange;
        SPRITE_CACHE_MAP[key] = sprite;
      }
    }
    return SPRITE_CACHE_MAP[key];
  };

  const getCollisionMod = () => {
    const info = motions[curMotionKey][curDirection];
    if (!info) {
      throw new Error(`[Object.getCollisionMod] no sprite info. ${name}:${curMotionKey}:${curDirection}`);
    }
    if (info.collision) {
      return { modX: info.collision.x, modY: info.collision.y };
    }
    return { modX: 0, modY: 0};
  };

  const setDirection = (next: Direction) => {
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
    curSprite = getMotionSprite();
    container.addChild(curSprite);
  };

  const changeMotion = (next: string) => {
    if (!Object.prototype.hasOwnProperty.call(motions, next)) {
      throw new Error(`[object.changeMotion] "${name}" does not have sprite ${next}.`);
    }
    if (curSprite) {
      stop();
      container.removeChild(curSprite);
    }
    curMotionKey = next;
    curSprite = getMotionSprite();
    container.addChild(curSprite);
  };

  const load = async () => {
    const data = Object.keys(motions)
      .map((motionKey) => {
        const frames = Object.keys(motions[motionKey]).map((dir) => {
          return getFrames(motionKey, dir as Direction);
        });
        return frames;
      })
      .flatMap((x) => x)
      .reduce((acc, each_frames) => ({
        ...acc,
        frames: {
          ...acc.frames,
          ...each_frames.reduce((e_acc, info) => ({
            ...e_acc,
            [`${info.key}`]: {
              frame: info.frame
            }
          }), {})
        }
      }), {
        frames: {},
        meta: {
          scale: '1'
        }
      });
    const sheet = new Spritesheet(getTexture(url), data);
    await sheet.parse();
    loaded = true;
    setDirection(curDirection);
  };

  const isLoaded = () => loaded;

  const setPosition = (x: number, y: number, _z?: number) => {
    const { modX, modY } = getCollisionMod();
    container.x = x - modX;
    container.y = y - modY;
    if (_z !== undefined) {
      z = _z;
    }
    const { h } = getArea();
    container.zIndex = z * Z_INDEX_MOD + container.y + h;
  };

  const getPosition = () => {
    const { modX, modY } = getCollisionMod();
    return {
      x: container.x + modX,
      y: container.y + modY,
      z: z
    };
  };

  const getWidth = () => {
    const info = getMotionInfo();
    const collision = info.collision;
    if (collision) {
      return collision.w;
    }
    return info.areaList[0].w;
  };

  const getHeight = () => {
    const info = getMotionInfo();
    const collision = info.collision;
    if (collision) {
      return collision.h;
    }
    return info.areaList[0].h;
  };

  const getArea = () => {
    const { x, y, z } = getPosition();
    const w = getWidth();
    const h = getHeight();
    return { x, y, z, w, h };
  };

  const getCenterPosition = () => {
    const { x, y } = getPosition();
    return { x: x + getWidth() / 2, y: y + getHeight() / 2 };
  };

  const play = (speed = 1) => {
    if (!loaded) {
      throw new Error(`[object.play] "${name}" is not loaded.`);
    }
    if (curSprite && curSprite instanceof AnimatedSprite && !curSprite.playing) {
      curSprite.animationSpeed = speed * DEFAULT_ANIMATION_SPEED;
      curSprite.loop = true;
      curSprite.play();
    }
  };

  const stop = () => {
    if (curSprite instanceof AnimatedSprite && curSprite.playing) {
      curSprite.stop();
    }
  };

  return Object.freeze({
    name,
    container,
    load,
    isLoaded,
    setDirection,
    changeMotion,
    setPosition,
    getPosition,
    getWidth,
    getHeight,
    getArea,
    getCenterPosition,
    play,
    stop,
  });
}

type SpriteInfo = {
  areaList: Area[];
  collision?: Area;
}

type DirectionalSpriteInfo = {
  up?: SpriteInfo;
  down: SpriteInfo;
  left?: SpriteInfo;
  right?: SpriteInfo;
}

const getTexture = (imgUrl: string) => {
  if (!TEXTURE_CACHE_MAP[imgUrl]) {
    TEXTURE_CACHE_MAP[imgUrl] = BaseTexture.from(imgUrl);
  }
  return TEXTURE_CACHE_MAP[imgUrl];
};

export type ObjType = ReturnType<typeof createObject>
