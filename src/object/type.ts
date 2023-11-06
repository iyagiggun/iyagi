import IObject from ".";
import { Area } from "../utils/coordinates/type";

export type Direction = 'up' | 'down' | 'left' | 'right';

interface SpriteInfo {
  areaList: Area[];
  collision?: Area;
}

interface ActionInfo {
  up?: SpriteInfo;
  down: SpriteInfo;
  left?: SpriteInfo;
  right?: SpriteInfo;
  loop?: boolean;
  onAction?: (frameIndex: number) => void;
}

export interface IObjectParameter {
  name?: string;
  sprite: {
    url: string;
    actions: {
      default: ActionInfo;
      [key:string]: ActionInfo;
    };
  };
  z?: number;
}

export type IObjectCreated = ReturnType<typeof IObject.create>;