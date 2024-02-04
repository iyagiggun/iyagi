export function calcSpeed(distance: number): 0 | 1 | 2 | 3;
export type EventType = 'move' | 'stop';
export namespace BasicController {
    export { control };
    export { e as event };
}
/**
 *
 * @param {import('pixi.js').Application} app
 */
declare function control(app: import('pixi.js').Application): void;
declare namespace e {
    let move: {
        bind: (action: (p: {
            deltaX: number;
            deltaY: number;
            speed: number;
        }) => void) => void;
        binded: () => ((p: {
            deltaX: number;
            deltaY: number;
            speed: number;
        }) => void) | null;
        fire: (p: {
            deltaX: number;
            deltaY: number;
            speed: number;
        }) => void;
        release: () => void;
    };
    let stop: {
        bind: (action: (p: any) => void) => void;
        binded: () => ((p: any) => void) | null;
        fire: (p: any) => void;
        release: () => void;
    };
}
export {};
