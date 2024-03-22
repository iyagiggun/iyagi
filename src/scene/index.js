/* eslint-disable max-classes-per-file */
import { Container } from 'pixi.js';
import { ITile } from '../object/tile';
import {
  getDirectionByDelta, getNextX, getNextY, getOverlappingArea,
} from '../utils/coordinates';
import { Camera } from './camera';

/**
 * @typedef {Object} SceneParameter
 * @property {string} name
 * @property {import('../object').IObject[]} objects
 * @property {() => (Promise<any>)} take resolve next scene key.
 */

class SceneObjects {
  #scene;

  #objects;

  #loaded = false;

  /**
   * @param {IScene} scene
   * @param {import('../object').IObject[]} objects
   */
  constructor(scene, objects) {
    this.#scene = scene;
    this.#objects = objects;
  }

  async load() {
    if (!this.#loaded) {
      await Promise.all(this.#objects.map((o) => o.load()));
      this.#objects.forEach((obj) => {
        this.#scene.container.addChild(obj.container);
        // eslint-disable-next-line no-param-reassign
        obj.scene = this.#scene;
      });
    }
    this.#loaded = true;
  }

  release() {
    this.#objects.forEach((obj) => {
      this.#scene.container.removeChild(obj.container);
      // eslint-disable-next-line no-param-reassign
      obj.scene = null;
    });
  }

  /**
   * @param {import('../object').IObject} target
   */
  delete(target) {
    if (this.#objects.includes(target)) {
      this.#scene.container.removeChild(target.container);
      this.#objects = this.#objects.filter((item) => item !== target);
    }
  }

  /**
   * @param {import('../object').IObject} target
   */
  add(target) {
    if (!this.#objects.includes(target)) {
      this.#scene.container.addChild(target.container);
      this.#objects.push(target);
    }
  }

  /**
   * @param {import('../object').IObject} target
   * @param {import('../utils/coordinates').Position} delta
   */
  move(target, delta) {
    const {
      x: curX, y: curY, w, h,
    } = target.area();
    const { x: deltaX, y: deltaY } = delta;

    const nextX = getNextX({ target, delta: deltaX, objects: this.#objects });
    const nextY = getNextY({ target, delta: deltaY, objects: this.#objects });

    target.positionAt({ x: nextX, y: nextY });
    target.directTo(getDirectionByDelta(deltaX, deltaY));

    this.#objects.forEach((obj) => {
      if (obj instanceof ITile) {
        if (typeof obj.event.in === 'function') {
          const tileArea = obj.area();
          const beforeIn = getOverlappingArea(tileArea, {
            x: curX, y: curY, w, h,
          });
          const afterIn = getOverlappingArea(tileArea, {
            x: nextX, y: nextY, w, h,
          });
          if (!beforeIn && afterIn) {
            obj.event.in(target);
          }
        }
        if (typeof obj.event.out === 'function') {
          const tileArea = obj.area();
          const beforeIn = getOverlappingArea(tileArea, {
            x: curX, y: curY, w, h,
          });
          const afterIn = getOverlappingArea(tileArea, {
            x: nextX, y: nextY, w, h,
          });
          if (beforeIn && !afterIn) {
            obj.event.out(target);
          }
        }
      }
    });
  }

  /**
     * @param {import('../utils/coordinates').Area} area
     */
  overlapped(area) {
    return [...this.#objects]
      .filter((o) => !!getOverlappingArea(o.area(), area));
  }
}

class IScene {
  name;

  /** @type {import('../iyagi').Iyagi | null} */
  iyagi = null;

  container = new Container();

  #loaded = false;

  camera = new Camera(this);

  objects;

  take;

  /**
   * @param {SceneParameter} p
   */
  constructor(p) {
    this.name = p.name;
    this.take = p.take;
    this.container.sortableChildren = true;
    this.objects = new SceneObjects(this, p.objects);
  }

  application() {
    if (!this.iyagi) {
      throw new Error('No iyagi.');
    }
    return this.iyagi.application;
  }

  async load() {
    if (!this.#loaded) {
      await this.objects.load();
      this.#loaded = true;
    }
  }

  release() {
    this.objects.release();
  }
}

export { IScene };
