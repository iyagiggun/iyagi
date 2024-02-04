export type InOutHandler = (object: import('../').IObject) => void;
/**
 * @typedef {(object: import('../').IObject) => void} InOutHandler
 */
export class ITileEvent extends IObjectEvent {
    /** @type {InOutHandler | null} */
    in: InOutHandler | null;
    /** @type {InOutHandler | null} */
    out: InOutHandler | null;
}
import { IObjectEvent } from "../event";
