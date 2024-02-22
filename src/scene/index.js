import { Container } from 'pixi.js';
import {
  getDirectionByDelta, getNextX, getNextY, getOverlappingArea,
} from '../utils/coordinates';
import { BasicController } from './controller';
import { Camera } from './camera';
import { ITile } from '../object/tile';

const _movementStopMap = new WeakMap();

/**
 * @typedef {Object} SceneParameter
 * @property {string} name
 * @property {import('../object').IObject[]} objects
 * @property {() => (Promise<any>)} take resolve next scene key.
 */

class IScene {
  name;

  /** @type {import('../iyagi').Iyagi | null} */
  iyagi = null;

  container = new Container();

  #loaded = false;

  /** @type {import('../object').IObject[]} */
  #objects = [];

  camera = new Camera(this);

  take;

  /**
   * @param {SceneParameter} p
   */
  constructor(p) {
    this.name = p.name;
    this.#objects = p.objects;
    this.take = p.take;
    this.container.sortableChildren = true;
  }

  /**
   * @param {import('../object').IObject} target
   * @param {number} deltaX
   * @param {number} deltaY
   */
  #move(target, deltaX, deltaY) {
    const {
      x: curX, y: curY, w, h,
    } = target.area();
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

  async load() {
    if (!this.#loaded) {
      await Promise.all(this.#objects.map((o) => o.load()));
      this.#loaded = true;
    }
    this.#objects.forEach((obj) => {
      this.container.addChild(obj.container);
      // eslint-disable-next-line no-param-reassign
      obj.scene = this;
    });
  }

  release() {
    this.#objects.forEach((obj) => {
      this.container.removeChild(obj.container);
      // eslint-disable-next-line no-param-reassign
      obj.scene = null;
    });
  }

  objects = {
    /**
     * @param {import('../object').IObject} target
     */
    delete: (target) => {
      if (this.#objects.includes(target)) {
        this.container.removeChild(target.container);
        this.#objects = this.#objects.filter((item) => item !== target);
      }
    },
    /**
     * @param {import('../object').IObject} target
     */
    add: (target) => {
      if (!this.#objects.includes(target)) {
        this.container.addChild(target.container);
        this.#objects.push(target);
      }
    },
    /**
     * @param {import('../object').IObject} target} target
     * @param {boolean} [interrupted]
     * @returns
     */
    stop: (target, interrupted) => {
      const movementStop = _movementStopMap.get(target);
      if (!movementStop) {
        return;
      }
      target.stop();
      this.iyagi?.application.ticker.remove(movementStop.tick);
      movementStop.resolve(interrupted || false);
      _movementStopMap.delete(target);
    },
    /**
     * @param {import('../object').IObject} target
     * @param {import('../utils/coordinates').Position} pos
     * @param {Object} [options]
     * @param {number} [options.speed]
     * @param {boolean} [options.focusing]
     */
    move: (target, pos, options) => new Promise((resolve) => {
      const speed = (options?.speed ?? 1) * 2;

      this.objects.stop(target);

      const tick = () => {
        const { x: curX, y: curY } = target.position();
        const diffX = pos.x - curX;
        const diffY = pos.y - curY;
        const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
        const arrived = distance < speed;

        if (arrived) {
          target.positionAt({ x: pos.x, y: pos.y });
        } else {
          const deltaX = speed * (diffX / distance);
          const deltaY = speed * (diffY / distance);
          this.#move(target, deltaX, deltaY);
          target.play({ speed });
          if (this.camera.target === target) {
            this.camera.pointTo(target);
            this.camera.target = target;
          }
        }

        if (arrived) {
          this.objects.stop(target);
        }
      };
      target.play({ speed });
      _movementStopMap.set(target, { tick, resolve });
      this.iyagi?.application.ticker.add(tick);
    }),
    list: () => this.#objects,
    /**
     * @param {import('../utils/coordinates').Area} area
     */
    overlapped: (area) => [...this.#objects]
      .filter((o) => !!getOverlappingArea(o.area(), area)),
  };

  /**
   * @param {import('../object/character').ICharacter} player
   */
  control(player) {
    const app = this.iyagi?.application;
    if (!app) {
      return;
    }
    BasicController.control(app);
    BasicController.event.move.bind(({ deltaX, deltaY, speed }) => {
      this.#move(player, deltaX, deltaY);
      this.camera.pointTo(player.center());
      player.play({ speed });
    });
    BasicController.event.stop.bind(() => {
      player.stop();
    });
    this.camera.pointTo(player.center());
  }
}

export { IScene };
