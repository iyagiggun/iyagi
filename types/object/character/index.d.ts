export type AdditionalParameter = {
    /**
     * - "default" key is required
     */
    photoMap?: {
        [x: string]: string;
    } | undefined;
};
export type CharacterParameter = import('..').ObjectParameter & AdditionalParameter;
/**
 * @typedef {Object} AdditionalParameter
 * @property {Object<string, string>} [AdditionalParameter.photoMap]
 * - "default" key is required
 */
/**
 * @typedef {import('..').ObjectParameter & AdditionalParameter} CharacterParameter
 */
export class ICharacter extends IObject {
    /**
     * @param {CharacterParameter} p
     */
    constructor(p: CharacterParameter);
    /**
     * @param {string} message
     */
    talk(message: string): Promise<any>;
    photo(): Sprite;
    #private;
}
import { IObject } from '..';
import { Sprite } from 'pixi.js';
