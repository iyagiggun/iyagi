import { shard_container } from '../const/index.js';
import { camera } from './camera.js';
import { objects } from './objects.js';

const _objects = objects(shard_container);
const _camera = camera(shard_container, _objects);

export const shard = {
  objects: _objects,
  camera: _camera,
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
