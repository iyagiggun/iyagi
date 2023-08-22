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
  sprite_url: string;
  sprite_info_map:{
    default: DirectionalSpriteInfo;
    [key: string]: DirectionalSpriteInfo;
  }
}

export const create_object = ({
  name,
  sprite_url,
  sprite_info_map
}: ObjectProps) => {

  const container = new Container();

  let loaded = false;
  const cur_sprite_key = 'default';
  let cur_direction: Direction = 'down';

  const get_sprite_info = (_sprite_key?: string, _dir?: Direction) => {
    const sprite_key = _sprite_key ?? cur_sprite_key;
    const dir = _dir ?? cur_direction;
    const info = sprite_info_map[sprite_key][dir];
    if (!info) {
      throw new Error(`[object.set_position] no sprite info. ${name}:${cur_sprite_key}:${cur_direction}`);
    }
    return info;
  };

  const get_frames = (sprite_key: string, dir: Direction) => {
    return get_sprite_info(sprite_key, dir).area_list.map((area, idx) => ({
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

  const get_collision_mod = () => {
    const info = sprite_info_map[cur_sprite_key][cur_direction];
    if (!info) {
      throw new Error(`[object.set_position] no sprite info. ${name}:${cur_sprite_key}:${cur_direction}`);
    }
    if (info.collision_area) {
      return { mod_x: info.collision_area.x, mod_y: info.collision_area.y };
    }
    return { mod_x: 0, mod_y: 0};
  };

  const change_direction = (next_direction: Direction) => {
    if (!loaded) {
      cur_direction = next_direction;
      return;
    }
    if (cur_direction === next_direction) {
      // return;
    }
    const last_sprite = get_current_sprite();
    container.removeChild(last_sprite);
    cur_direction = next_direction;
    const next_sprite = get_current_sprite();
    container.addChild(next_sprite);
  };

  const load = async () => {
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
    const sheet = new Spritesheet(get_texture(sprite_url), data);
    await sheet.parse();
    loaded = true;
    change_direction(cur_direction);
  };

  const is_loaded = () => loaded;

  const set_position = (x: number, y: number) => {
    const { mod_x, mod_y } = get_collision_mod();
    container.x = x - mod_x;
    container.y = y - mod_y;
  };

  const get_position = () => {
    const { mod_x, mod_y } = get_collision_mod();
    return {
      x: container.x + mod_x,
      y: container.y + mod_y
    };
  };

  const get_width = () => {
    const sprite_info = get_sprite_info();
    const collision_area = sprite_info.collision_area;
    if (collision_area) {
      return collision_area.w;
    }
    return sprite_info.area_list[0].w;
  };

  const get_height = () => {
    const sprite_info = get_sprite_info();
    const collision_area = sprite_info.collision_area;
    if (collision_area) {
      return collision_area.h;
    }
    return sprite_info.area_list[0].h;
  };

  const get_center_position = () => {
    const { x, y } = get_position();
    return { x: x + get_width() / 2, y: y + get_height() / 2 };
  };

  return Object.freeze({
    name,
    container,
    load,
    is_loaded,
    change_direction,
    set_position,
    get_position,
    get_width,
    get_height,
    get_center_position,
  });
};

export type ObjectType = ReturnType<typeof create_object>
