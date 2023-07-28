import { AnimatedSprite, BaseTexture, Container, Sprite, Spritesheet, Texture } from 'pixi.js';
import { Area, Direction } from '../utils/area';

type SpriteInfo = {
  areaList: Area[];
  collisionArea?: Area;
}

type DirectionalSpriteInfo = {
  up?: SpriteInfo;
  down: SpriteInfo;
  left?: SpriteInfo;
  right?: SpriteInfo;
}

export type DirectionalSprite = {
  up?: Sprite;
  down: Sprite;
  left?: Sprite;
  right?: Sprite;
}

export interface ObjectOptions {
  imgUrl: string;
  spriteInfoMap: {
    default: DirectionalSpriteInfo;
    [key: string]: DirectionalSpriteInfo;
  }
}

let spriteNamePrefix = 1;

const TEXTURE_MAP: { [key: string] : BaseTexture } = {};
const getTexture = (imgUrl: string) => {
  if (!TEXTURE_MAP[imgUrl]) {
    TEXTURE_MAP[imgUrl] = BaseTexture.from(imgUrl);
  }
  return TEXTURE_MAP[imgUrl];
};

const areaListToFrame = (prefix: string, areaList?: Area[]) => {
  if (!areaList) {
    return {};
  }
  return areaList.reduce((frames, { x, y, w, h }, idx) => ({
    ...frames,
    [`${prefix}:${idx}`]: {
      frame: {
        x, y, w, h,
      },
    },
  }), {});
};

const getSprite = (
  frameKeyList: string[],
  // options?: ISpriteOptions,
) => {
  if (frameKeyList.length === 1) {
    return Sprite.from(frameKeyList[0]);
  }
  if (frameKeyList.length > 1) {
    const aSprite = new AnimatedSprite(frameKeyList.map((key) => Texture.from(key)));
    aSprite.loop = true;
    // aSprite.onFrameChange = options?.onFrameChange;
    return aSprite;
  }
  return undefined;
};

async function getDirectionalSpriteMap(imgUrl: string, key: string, info: DirectionalSpriteInfo) {
  const framesMap = Object.keys(info).reduce<{ [key:string]: object }>((acc, dir) => ({
    ...acc,
    [dir]: areaListToFrame(
      // eslint-disable-next-line no-plusplus
      `${spriteNamePrefix++}:${imgUrl}:${dir}`,
      info[dir as 'up' | 'down' | 'left' | 'right']?.areaList,
    ),
  }), {});

  await new Spritesheet(getTexture(imgUrl), {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    frames: Object.values(framesMap).reduce((acc, each) => ({ ...acc, ...each }), {}) as { [key: string]: any },
    meta: {
      scale: '1',
    },
  }).parse();

  return {
    [key]: Object.keys(framesMap).reduce<{[key:string]: Sprite | undefined}>((acc, dir) => ({
      ...acc,
      [dir]: getSprite(Object.keys(framesMap[dir])),
    }), {})
  };
}

interface ObjectPrototype {
  name: string;
  options?: ObjectOptions;
  _container?: Container;
  _dir: Direction;
  _directionalSprite: string;
  _directionalSpriteMap?: { [key: string]: DirectionalSprite };
  _init(name: string, options: ObjectOptions): void;
  getContainer(): Container;
  load(): Promise<void>;
  _setDirectionalSprite(key: string): void;
  getSprite(): Sprite;
  getCollisionMod(): Area;
  setPos(x: number, y:number): ObjectPrototype;
  getPos(): { x: number, y: number };
  setDirection(dir: Direction): ObjectPrototype;
}

const ObjectPrototype: ObjectPrototype = {
  name: '',
  _dir: 'down' as Direction,
  _directionalSprite: 'default',
  _init(name: string, options: ObjectOptions) {
    this.name = name;
    this.options = options;
    this._container = new Container();
  },
  getContainer() {
    if (!this._container) {
      throw new Error(`[object.getContainer] no container. ${this.name}`);
    }
    return this._container;
  },
  async load() {
    const options = this.options;
    if (!options) {
      throw new Error('[object.load] not inited.');
    }
    const promiseList = Object.keys(options.spriteInfoMap)
      .map((key) => getDirectionalSpriteMap(options.imgUrl, key, options.spriteInfoMap[key]));

    this._directionalSpriteMap = (await Promise.all(promiseList)).reduce((acc, each) => {
      return {
        ...acc,
        ...each
      };
    }, {}) as { [key: string]: DirectionalSprite };

    this._setDirectionalSprite('default');
  },
  _setDirectionalSprite(key: string) {
    if (!this._directionalSpriteMap?.[key]) {
      throw new Error(`[object.setDirectionSprite] no directionalSprite. ${this.name}:${key}`);
    }
    this._directionalSprite = key;
    this.setDirection(this._dir);
  },
  getSprite() {
    const sprite = this._directionalSpriteMap?.[this._directionalSprite]?.[this._dir];
    if (!sprite) {
      throw new Error(`[object.getSprite] Fail to get sprite. ${this.name}:${this._dir}`);
    }
    return sprite;
  },
  getCollisionMod() {
    const spriteInfo = this.options?.spriteInfoMap[this._directionalSprite][this._dir];
    if (!spriteInfo) {
      throw new Error('[object.getCollisionArea] No sprite info');
    }
    if (spriteInfo.collisionArea) {
      return spriteInfo.collisionArea;
    }
    const { w, h } = spriteInfo.areaList[0];
    return { x: 0, y: 0, w, h };
  },
  setPos(x: number, y: number) {
    const { x: modX, y: modY } = this.getCollisionMod();
    this.getContainer().x = x - modX;
    this.getContainer().y = y - modY;
    return this;
  },
  getPos() {
    const { x, y } = this.getContainer();
    return { x, y };
  },
  setDirection(dir: Direction) {
    const container = this.getContainer();
    // remove last sprite
    if (this._directionalSpriteMap) {
      const lastSprite = this._directionalSpriteMap[this._directionalSprite][this._dir];
      if (lastSprite) {
        container.removeChild(lastSprite);
      }
      const nextSprite = this._directionalSpriteMap[this._directionalSprite][dir];
      if (!nextSprite) {
        throw new Error(`[object.setDirection] no sprite. ${this.name}:${dir}`);
      }
      container.addChild(nextSprite);
    }
    this._dir = dir;
    return this;
  }
};

export { ObjectPrototype };
