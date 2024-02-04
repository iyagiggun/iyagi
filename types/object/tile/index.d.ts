export class ITile extends IObject {
    /**
     * @param {import('..').MonoParameter} p
     */
    constructor({ name, image, frames, hitbox, }: import('..').MonoParameter);
    /** @type {ITileEvent} */
    event: ITileEvent;
}
import { IObject } from '..';
import { ITileEvent } from './event';
