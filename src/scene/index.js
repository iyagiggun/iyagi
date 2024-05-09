/* eslint-disable max-classes-per-file */
import { Container } from 'pixi.js';
import { Camera } from './camera';
import SceneObjects from './objects';
import SceneController from './controller';

/**
 * @typedef {import('../object').IObject} IObject
 */

/**
 * @typedef {Object} SceneParameter
 * @property {string} name
 * @property {() => IObject[]} objects
 * @property {(self: IScene) => (Promise<any>)} take resolve next scene key.
 * @property {any} [key]
 */

class IScene {
  #p;

  name;

  key;

  /** @type {import('../iyagi').Iyagi | null} */
  iyagi = null;

  container = new Container();

  #loaded = false;

  camera = new Camera(this);

  objects = new SceneObjects(this, []);

  controller = SceneController;

  take;

  /**
   * @param {SceneParameter} p
   */
  constructor(p) {
    this.#p = p;
    this.name = p.name;
    this.key = p.key || this.name;
    this.take = p.take;
    this.container.sortableChildren = true;
  }

  get application() {
    if (!this.iyagi) {
      throw new Error('No iyagi.');
    }
    return this.iyagi.application;
  }

  // eslint-disable-next-line class-methods-use-this
  set application(_) {
    throw new Error('application is readonly');
  }

  async load() {
    if (!this.#loaded) {
      await this.objects.add(this.#p.objects());
      this.#loaded = true;
    }
  }

  release() {
    this.controller.release();
    this.objects.release();
  }
}

export { IScene };
