import ICharacter from '.';
import { IObjectParameter } from '../type';

export interface ICharacterParameter extends IObjectParameter {
  photoMap?: {
    default: string;
    [key: string]: string;
  }
}

export type ICharacterCreated = ReturnType<typeof ICharacter.create>;