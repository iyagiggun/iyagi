export namespace status {
    export { create };
}
import { BasicStatusBar } from './bar';
/**
 * @template T
 * @param {T} data
 */
declare function create<T>(data: T): {
    /**
     * @param {Partial<T>} next
     */
    set: (next: Partial<T>) => void;
    get: () => T;
    event: {
        change: {
            bind: (action: (p: {
                before: T;
                after: T;
            }) => void) => void;
            binded: () => ((p: {
                before: T;
                after: T;
            }) => void) | null;
            fire: (p: {
                before: T;
                after: T;
            }) => void;
            release: () => void;
        };
    };
};
export { BasicStatusBar };
