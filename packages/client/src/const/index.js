import { Container } from 'pixi.js';

export const FRAMES_PER_SECOND = 60;
export const DEFAULT_FPS = 6;
export const DEFAULT_ANIMATION_SPEED = 6 / FRAMES_PER_SECOND;

export const shard_container = new Container();

/**
 * @typedef {Object} ClientMessage
 * @property {string} type
 * @property {*} [data]
 */
