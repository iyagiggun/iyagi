import { Container } from 'pixi.js';
import { camera } from './camera.js';
import { objects } from './objects.js';

export const container = new Container();

export const shard = {
  container,
  objects: objects(container),
  camera: camera(container),
  load: {
    /**
     * Override as needed.
     * @param {import('pixi.js').Container} container
     */
    // eslint-disable-next-line no-unused-vars
    before: (container) => Promise.resolve(),
    /**
     * Override as needed.
     * @param {import('pixi.js').Container} container
     */
    // eslint-disable-next-line no-unused-vars
    after: (container) => Promise.resolve(),
  },
  clear: {
    /**
     * Override as needed.
     * @param {import('pixi.js').Container} container
     */
    // eslint-disable-next-line no-unused-vars
    before: (container) => Promise.resolve(),
    /**
     * Override as needed.
     * @param {import('pixi.js').Container} container
     */
    // eslint-disable-next-line no-unused-vars
    after: (container) => Promise.resolve(),
  },
};
