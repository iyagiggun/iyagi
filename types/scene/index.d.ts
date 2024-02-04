export type SceneParameter = {
    name: string;
    tiles: import('../object/tile').ITile[];
    objects?: import("../object").IObject[] | undefined;
    take: () => (Promise<IScene | null>);
};
/**
 * @typedef {Object} SceneParameter
 * @property {string} name
 * @property {import('../object/tile').ITile[]} tiles
 * @property {import('../object').IObject[]} [objects]
 * @property {() => (Promise<IScene|null>)} take
 */
export class IScene {
    /**
     * @param {SceneParameter} p
     */
    constructor(p: SceneParameter);
    name: string;
    /** @type {import('../iyagi').Iyagi | null} */
    iyagi: import('../iyagi').Iyagi | null;
    container: Container<import("pixi.js").DisplayObject>;
    take: () => (Promise<IScene | null>);
    load(): Promise<void>;
    release(): void;
    objects: {
        /**
         * @param {import('../object').IObject} target
         */
        delete: (target: import('../object').IObject) => void;
        /**
         * @param {import('../object').IObject} target
         */
        add: (target: import('../object').IObject) => void;
        /**
         * @param {import('../object').IObject} target} target
         * @param {boolean} [interrupted]
         * @returns
         */
        stop: (target: import('../object').IObject, interrupted?: boolean | undefined) => void;
        /**
         * @param {import('../object').IObject} target
         * @param {import('../utils/coordinates').Position} pos
         * @param {Object} [options]
         * @param {number} [options.speed]
         * @param {boolean} [options.focusing]
         */
        move: (target: import('../object').IObject, pos: import('../utils/coordinates').Position, options?: {
            speed?: number | undefined;
            focusing?: boolean | undefined;
        } | undefined) => Promise<any>;
        /**
         * @param {import('../utils/coordinates').Area} area
         */
        overlapped: (area: import('../utils/coordinates').Area) => import("../object").IObject[];
    };
    /**
     * @param {import('../object/character').ICharacter} player
     */
    control(player: import('../object/character').ICharacter): void;
    #private;
}
import { camera } from './camera';
import { Container } from 'pixi.js';
export { camera };
