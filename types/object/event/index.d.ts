export type TapHandler = () => void;
/**
 * @typedef {() => void} TapHandler
 */
export class IObjectEvent {
    /**
     * @param {import('../').IObject} obj
     */
    constructor(obj: import('../').IObject);
    /**
     * @param {TapHandler | null} handler
     */
    set tap(handler: TapHandler | null);
    get tap(): TapHandler | null;
    #private;
}
