import IObject from ".";

export type Direction = 'up' | 'down' | 'left' | 'right';

interface Area {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SpriteInfo {
  areaList: Area[];
  collision?: Area;
}

interface DirectionalSpriteInfo {
  up?: SpriteInfo;
  'down': SpriteInfo;
  left?: SpriteInfo;
  right?: SpriteInfo;
}

export interface IObjectParameter {
  name?: string;
  sprite: {
    url: string;
    motions: {
      [key:string]: DirectionalSpriteInfo;
    };
  };
  z?: number;
}

export type IObjectCreated = ReturnType<typeof IObject.create>;