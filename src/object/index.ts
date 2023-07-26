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

export type ObjectOptions = {
  imgUrl: string;
  spriteInfoMap: {
    default: DirectionalSpriteInfo;
    [key: string]: DirectionalSpriteInfo;
  }
}

export type DirectionalSprite = {
  up?: Sprite;
  down: Sprite;
  left?: Sprite;
  right?: Sprite;
}

interface ObjectPrototype {
  name: string;
  options?: ObjectOptions;
  _container?: Container;
  _dir: Direction;
  _directionalSprite?: DirectionalSprite;
  _directionalSpriteMap?: { [key: string]: DirectionalSprite };
  _init(name: string, options: ObjectOptions): void;
  getContainer(): Container;
  load(): Promise<void>;
  _setDirectionalSprite(key: string): void;
  getSprite(): Sprite;
  setPos(x: number, y:number): ObjectPrototype;
  getPos(): { x: number, y: number };
  setDirection(dir: Direction): ObjectPrototype;
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

const ObjectPrototype: ObjectPrototype = {
  name: '',
  _dir: 'down' as Direction,
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
    const ds = this._directionalSpriteMap?.[key];
    if (!ds) {
      throw new Error(`[object.setDirectionSprite] no directionalSprite. ${this.name}:${key}`);
    }
    this._directionalSprite = ds;
    this.setDirection(this._dir);
  },
  getSprite() {
    const sprite = this._directionalSprite?.[this._dir];
    if (!sprite) {
      throw new Error(`[object.getSprite] Fail to get sprite. ${this.name}:${this._dir}`);
    }
    return sprite;
  },
  setPos(x: number, y: number) {
    this.getContainer().x = x;
    this.getContainer().y = y;
    return this;
  },
  getPos() {
    const { x, y } = this.getContainer();
    return { x, y };
  },
  setDirection(dir: Direction) {
    const container = this.getContainer();
    // remove last sprite
    if (this._directionalSprite) {
      const lastSprite = this._directionalSprite[this._dir];
      if (lastSprite) {
        container.removeChild(lastSprite);
      }
      const nextSprite = this._directionalSprite[dir];
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
