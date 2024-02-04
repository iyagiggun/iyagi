import { Container } from 'pixi.js';
import {
  getDirectionByDelta, getNextX, getNextY, getOverlappingArea,
} from '../utils/coordinates';
import { devtools } from '../utils/devtools';
import { BasicController } from './controller';
import { camera } from './camera';

const _movementStopMap = new WeakMap();

/**
 * @typedef {Object} SceneParameter
 * @property {string} name
 * @property {import('../object/tile').ITile[]} tiles
 * @property {import('../object').IObject[]} [objects]
 * @property {() => (Promise<IScene|null>)} take
 */

class IScene {
  name;

  /** @type {import('../iyagi').Iyagi | null} */
  iyagi = null;

  container = new Container();

  #loaded = false;

  /** @type {import('../object/tile').ITile[]} */
  #tiles = [];

  /** @type {import('../object').IObject[]} */
  #objects = [];

  take;

  /**
   * @param {SceneParameter} p
   */
  constructor(p) {
    this.name = p.name;
    this.#objects = (p.objects ?? []).slice();
    this.#tiles = p.tiles.slice();
    this.take = p.take;
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

    this.#tiles
      .forEach((tile) => {
        if (typeof tile.event.in === 'function') {
          const tileArea = tile.area();
          const beforeIn = getOverlappingArea(tileArea, {
            x: curX, y: curY, w, h,
          });
          const afterIn = getOverlappingArea(tileArea, {
            x: nextX, y: nextY, w, h,
          });
          if (!beforeIn && afterIn) {
            tile.event.in(target);
          }
        }
        if (typeof tile.event.out === 'function') {
          const tileArea = tile.area();
          const beforeIn = getOverlappingArea(tileArea, {
            x: curX, y: curY, w, h,
          });
          const afterIn = getOverlappingArea(tileArea, {
            x: nextX, y: nextY, w, h,
          });
          if (beforeIn && !afterIn) {
            tile.event.out(target);
          }
        }
      });
  }

  async load() {
    if (!this.#loaded) {
      await Promise.all([...this.#tiles, ...this.#objects].map((o) => o.load()));
      this.#loaded = true;
    }
    [...this.#tiles, ...this.#objects].forEach((obj) => {
      this.container.addChild(obj.container);
      // eslint-disable-next-line no-param-reassign
      obj.scene = this;
    });
  }

  release() {
    [...this.#tiles, ...this.#objects].forEach((obj) => {
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
        return;
      }
      if (devtools.enable) {
        console.warn(`[iyagi:scene] there is no "${target.name}" in "${this.name}" scene.`);
      }
    },
    /**
     * @param {import('../object').IObject} target
     */
    add: (target) => {
      if (!this.#objects.includes(target)) {
        this.container.addChild(target.container);
        this.#objects.push(target);
        return;
      }
      if (devtools.enable) {
        console.warn(`[iyagi:scene] already "${target.name}" is in "${this.name}" scene.`);
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
      const speed = options?.speed ?? 1;

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
          if (options?.focusing) {
            camera.focus(target);
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
      camera.focus(player);
      player.play({ speed });
    });
    BasicController.event.stop.bind(() => {
      player.stop();
    });
    camera.focus(player);
  }
}

export { IScene, camera };
