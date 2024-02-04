export class Iyagi {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {Object} options
     * @param {'production' | 'development'} [options.mode] default="production"
     */
    constructor(canvas: HTMLCanvasElement, options: {
        mode?: "production" | "development" | undefined;
    });
    application: Application<import("pixi.js").ICanvas>;
    /**
     * @param {import('../scene').IScene} scene
     */
    play(scene: import('../scene').IScene): Promise<void>;
}
import { Application } from 'pixi.js';
