import { AnimatedSprite, BaseTexture, Container, Sprite, Spritesheet, Texture } from 'pixi.js';
import { Area, Direction } from '../utils/area';

type SpriteInfo = {
  area_list: Area[];
  collision_area?: Area;
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

const TEXTURE_CACHE_MAP: { [key: string] : BaseTexture } = {};
const get_texture = (imgUrl: string) => {
  if (!TEXTURE_CACHE_MAP[imgUrl]) {
    TEXTURE_CACHE_MAP[imgUrl] = BaseTexture.from(imgUrl);
  }
  return TEXTURE_CACHE_MAP[imgUrl];
};

export type ObjectProps = {
  name: string;
  img_url: string;
  sprite_info_map:{
    default: DirectionalSpriteInfo;
    [key: string]: DirectionalSpriteInfo;
  }
}

export const create_object = ({
  name,
  img_url,
  sprite_info_map
}: ObjectProps) => {

  let loaded = false;
  const cur_sprite_key = 'default';
  let cur_direction: Direction = 'down';

  const get_frames = (sprite_key: string, dir: Direction) => {
    const sprite_info = sprite_info_map[sprite_key][dir];
    if (!sprite_info) {
      throw new Error(`[object.create_objer] no sprite info. ${sprite_key}:${dir}`);
    }
    return sprite_info.area_list.map((area, idx) => ({
      key: `${name}:${sprite_key}:${dir}:${idx}`,
      frame: area
    }));
  };

  const SPRITE_CACHE_MAP: { [key: string]: Sprite } = {};
  const get_current_sprite = () => {
    const frames = get_frames(cur_sprite_key, cur_direction);
    const key = frames.map((f) => f.key).join(',');
    if (!SPRITE_CACHE_MAP[key]) {
      if (frames.length === 1) {
        SPRITE_CACHE_MAP[key] = Sprite.from(frames[0].key);
      } else {
        const animated_sprite = new AnimatedSprite(frames.map((frame) => Texture.from(frame.key)));
        animated_sprite.loop = true;
        // animated_sprite.onFrameChange = onFrameChange;
        SPRITE_CACHE_MAP[key] = animated_sprite;
      }
    }
    return SPRITE_CACHE_MAP[key];
  };

  return Object.freeze({

    name,

    container: new Container(),

    async load() {
      const data = Object.keys(sprite_info_map)
        .map((sprite_key) => {
          const each_frames = Object.keys(sprite_info_map[sprite_key]).map((dir) => {
            return get_frames(sprite_key, dir as Direction);
          });
          return each_frames;
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
      const sheet = new Spritesheet(get_texture(img_url), data);
      await sheet.parse();
      loaded = true;
      this.change_direction(cur_direction);
    },

    is_loaded() {
      return loaded;
    },

    change_direction(next_direction: Direction) {
      if (!loaded) {
        cur_direction = next_direction;
        return;
      }
      if (cur_direction === next_direction) {
        // return;
      }
      const last_sprite = get_current_sprite();
      this.container.removeChild(last_sprite);
      cur_direction = next_direction;
      const next_sprite = get_current_sprite();
      this.container.addChild(next_sprite);
    },

    set_position(x: number, y: number) {
      const { modX, modY } = (() => {
        const info = sprite_info_map[cur_sprite_key][cur_direction];
        if (!info) {
          throw new Error(`[object.set_position] no sprite info. ${name}:${cur_sprite_key}:${cur_direction}`);
        }
        if (info.collision_area) {
          return { modX: info.collision_area.x, modY: info.collision_area.y };
        }
        return { modX: 0, modY: 0};
      })();
      this.container.x = x - modX;
      this.container.y = y - modY;
    }
  });
};

export type ObjectType = ReturnType<typeof create_object>
