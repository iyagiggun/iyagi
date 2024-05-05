/* eslint-disable max-classes-per-file */
import { Container } from 'pixi.js';
import { isArray } from 'lodash-es';
import { ITile } from '../object/tile';
import {
  getDirectionByDelta, getNextX, getNextY, getOverlappingArea,
} from '../utils/coordinates';
import { Camera } from './camera';

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

class SceneObjects {
  #scene;

  #objects;

  /**
   * @param {IScene} scene
   * @param {import('../object').IObject[]} objects
   */
  constructor(scene, objects) {
    this.#scene = scene;
    this.#objects = objects;
  }

  release() {
    this.#objects.forEach((obj) => {
      this.#scene.container.removeChild(obj.container);
      // eslint-disable-next-line no-param-reassign
      obj.scene = null;
    });
  }

  /**
   * @param {IObject} target
   */
  delete(target) {
    if (this.#objects.includes(target)) {
      this.#scene.container.removeChild(target.container);
      this.#objects = this.#objects.filter((item) => item !== target);
    }
  }

  /**
   * @param { IObject | IObject[] } target
   */
  async add(target) {
    // case items
    if (isArray(target)) {
      await Promise.all(target.map((e) => this.add(e)));
      return;
    }
    // case an item

    if (!this.#objects.includes(target)) {
      this.#objects.push(target);
    }
    if (!target.isLoaded()) {
      await target.load();
    }
    this.#scene.container.addChild(target.container);
    // eslint-disable-next-line no-param-reassign
    target.scene = this.#scene;
  }

  /**
   * @param {IObject} target
   * @param {import('../utils/coordinates').Position} delta
   */
  move(target, delta) {
    const {
      x: curX, y: curY, w, h,
    } = target.area();
    const { x: deltaX, y: deltaY } = delta;

    const nextX = getNextX({ target, delta: deltaX, objects: this.#objects });
    const nextY = getNextY({ target, delta: deltaY, objects: this.#objects });

    // eslint-disable-next-line no-param-reassign
    target.xy = { x: nextX, y: nextY };
    target.direct(getDirectionByDelta(deltaX, deltaY));

    this.#objects.forEach((obj) => {
      if (obj instanceof ITile) {
        const tileArea = obj.area();
        const beforeIn = getOverlappingArea(tileArea, {
          x: curX, y: curY, w, h,
        });
        const afterIn = getOverlappingArea(tileArea, {
          x: nextX, y: nextY, w, h,
        });
        if (!beforeIn && afterIn) {
          obj.emit('tilein', { target: obj, in: target });
        }
        if (beforeIn && !afterIn) {
          obj.emit('tileout', { target: obj, out: target });
        }
        // if (typeof obj.event.in === 'function') {
        //   const tileArea = obj.area();
        //   const beforeIn = getOverlappingArea(tileArea, {
        //     x: curX, y: curY, w, h,
        //   });
        //   const afterIn = getOverlappingArea(tileArea, {
        //     x: nextX, y: nextY, w, h,
        //   });
        //   if (!beforeIn && afterIn) {
        //     obj.event.in(target);
        //   }
        // }
        // if (typeof obj.event.out === 'function') {
        //   const tileArea = obj.area();
        //   const beforeIn = getOverlappingArea(tileArea, {
        //     x: curX, y: curY, w, h,
        //   });
        //   const afterIn = getOverlappingArea(tileArea, {
        //     x: nextX, y: nextY, w, h,
        //   });
        //   if (beforeIn && !afterIn) {
        //     obj.event.out(target);
        //   }
        // }
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
  #p;

  name;

  key;

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
    this.#p = p;
    this.name = p.name;
    this.key = p.key || this.name;
    this.take = p.take;
    this.container.sortableChildren = true;
    this.objects = new SceneObjects(this, []);
  }

  application() {
    if (!this.iyagi) {
      throw new Error('No iyagi.');
    }
    return this.iyagi.application;
  }

  async load() {
    if (!this.#loaded) {
      await this.objects.add(this.#p.objects());
      this.#loaded = true;
    }
  }

  release() {
    this.objects.release();
  }
}

export { IScene };
