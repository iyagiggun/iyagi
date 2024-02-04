export type Direction = "up" | "down" | "left" | "right";
export type SpriteImage = {
    url: string;
    scale?: number | undefined;
};
export type SpriteInfo = {
    image?: SpriteImage | undefined;
    frames?: import("../utils/coordinates").Area[] | undefined;
    hitbox?: import("../utils/coordinates").Area | undefined;
};
export type MotionInfo = {
    image?: SpriteImage | undefined;
    loop?: boolean | undefined;
    hitbox?: import("../utils/coordinates").Area | undefined;
    up?: SpriteInfo | undefined;
    down: SpriteInfo;
    left?: SpriteInfo | undefined;
    right?: SpriteInfo | undefined;
};
export type ObjectParameter = {
    name?: string | undefined;
    image: SpriteImage;
    motions: {
        [x: string]: MotionInfo;
    };
    z?: number | undefined;
};
export type MonoParameter = {
    image: SpriteImage;
    name?: string | undefined;
    frames?: import("../utils/coordinates").Area[] | undefined;
    hitbox?: import("../utils/coordinates").Area | undefined;
    z?: number | undefined;
};
/**
 * @typedef MonoParameter
 * @property {SpriteImage} image
 * @property {string} [name]
 * @property {import('../utils/coordinates').Area[]} [frames]
 * @property {import('../utils/coordinates').Area} [hitbox]
 * @property {number} [z]
 */
export class IObject {
    /**
     * @param {MonoParameter} param0
     * @returns
     */
    static createMono({ name, image, frames, hitbox, z, }: MonoParameter): IObject;
    /**
     * @param {ObjectParameter} p
     */
    constructor(p: ObjectParameter);
    name: string;
    /** @type {import('../scene').IScene | null} */
    scene: import('../scene').IScene | null;
    container: Container<import("pixi.js").DisplayObject>;
    event: IObjectEvent;
    load(): Promise<void>;
    isLoaded(): boolean;
    /**
     * @param {Object} pos
     * @param {number} [pos.x]
     * @param {number} [pos.y]
     * @param {number} [pos.z]
     */
    positionAt({ x, y, z }: {
        x?: number | undefined;
        y?: number | undefined;
        z?: number | undefined;
    }): void;
    position(): {
        x: number;
        y: number;
        z: number;
    };
    /**
     * @param {Direction} next
     */
    directTo(next: Direction): void;
    direction(): Direction;
    /**
     * @param {string} motion
     */
    change(motion: string): void;
    area(): {
        w: number;
        h: number;
        x: number;
        y: number;
        z: number;
    };
    center(): {
        x: number;
        y: number;
    };
    /**
     * @param {Object} [options]
     * @param {number} [options.speed]
     * @param {(frameIndex: number) => void} [options.onFrameChange]
     * @param {(frameIndex: number) => void} [options.onComplete]
     */
    play(options?: {
        speed?: number | undefined;
        onFrameChange?: ((frameIndex: number) => void) | undefined;
        onComplete?: ((frameIndex: number) => void) | undefined;
    } | undefined): void;
    stop(): void;
    #private;
}
import { Container } from 'pixi.js';
import { IObjectEvent } from './event';
