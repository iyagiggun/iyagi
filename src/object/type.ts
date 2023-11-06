import IObject from ".";
import { Area } from "../utils/coordinates/type";

export type Direction = 'up' | 'down' | 'left' | 'right';

interface SpriteInfo {
  areaList: Area[];
  collision?: Area;
}

interface MotionInfo {
  up?: SpriteInfo;
  down: SpriteInfo;
  left?: SpriteInfo;
  right?: SpriteInfo;
  loop?: boolean;
}

export interface IObjectParameter {
  name?: string;
  sprite: {
    url: string;
    motions: {
      default: MotionInfo;
      [key:string]: MotionInfo;
    };
  };
  z?: number;
}

export type IObjectCreated = ReturnType<typeof IObject.create>;