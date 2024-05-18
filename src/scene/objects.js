import { isArray } from 'lodash-es';
import { ITile } from '../object/tile';
import {
  getDirectionByDelta, getNextX, getNextY, getOverlappingArea,
} from '../utils/coordinates';

/**
 * @typedef {import('../object').IObject} IObject
 * @typedef {import('./index').IScene} IScene
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
    const targetWxH = w * h;

    const nextX = getNextX({ target, delta: deltaX, objects: this.#objects });
    const nextY = getNextY({ target, delta: deltaY, objects: this.#objects });

    // eslint-disable-next-line no-param-reassign
    target.xy = { x: nextX, y: nextY };
    target.direct(getDirectionByDelta(deltaX, deltaY));

    this.#objects.forEach((obj) => {
      if (obj instanceof ITile && obj.eventNames().length > 0) {
        const tile = obj;
        const tileArea = tile.area();
        const before = getOverlappingArea(tileArea, {
          x: curX, y: curY, w, h,
        });
        const after = getOverlappingArea(tileArea, {
          x: nextX, y: nextY, w, h,
        });
        const beforeOvlpRatio = before ? (before.w * before.h) / targetWxH : 0;
        const afterOvlpWxH = after ? (after.w * after.h) / targetWxH : 0;

        if (beforeOvlpRatio < 0.5 && afterOvlpWxH >= 0.5) {
          tile.emit('tilein', { target: tile, in: target });
        }
        if (beforeOvlpRatio >= 0.5 && afterOvlpWxH < 0.5) {
          tile.emit('tileout', { target: tile, out: target });
        }
        if (afterOvlpWxH >= 0.5) {
          tile.emit('tileon', { target: tile, on: target });
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

export default SceneObjects;
