export namespace event {
    export { create };
    export { createEventType };
}
/**
 * @param {import('pixi.js').Container} container
 */
declare function create(container: import('pixi.js').Container): {
    tap: {
        /**
         * @param {function(): void} action
         */
        bind: (action: () => void) => void;
        binded: () => (() => void) | null;
        release: () => void;
    };
};
/**
 * @template P
 * @param {(p:P) => void} initFunction
 */
declare function createEventType<P>(initFunction: (p: P) => void): {
    /**
     * @param {(p: P) => void} action
     */
    bind: (action: (p: P) => void) => void;
    binded: () => ((p: P) => void) | null;
    /**
     * @param {P} p
     */
    fire: (p: P) => void;
    release: () => void;
};
export {};
