import { Container } from 'pixi.js';
import IApplication from '../application';
import { getDirectionByDelta, getOverlappingArea } from '../utils/coordinates';
import ICamera from './camera';
import IController from './controller';
import IMessenger from './messenger';

class IScene {
  name;

  container = new Container();

  objectList;

  tileList;

  take;

  #camera;

  #controller;

  #messenger;

  #movementStopMap = new WeakMap();

  /**
   * @param {Object} param
   * @param {string} param.name
   * @param {import('../object').ITile[]} param.tileList
   * @param {import('../object').IObject[]} [param.objectList]
   * @param {() => Promise<IScene | null>} param.take
   */
  constructor({
    name,
    tileList,
    objectList,
    take,
  }) {
    this.name = name;
    this.#camera = ICamera.create(this.container);
    this.#controller = IController.create();
    this.#messenger = IMessenger.create();

    this.container.sortableChildren = true;
    this.objectList = objectList ?? [];
    this.tileList = tileList ?? [];
    this.take = take;
  }

  load() {
    return Promise.all([...this.tileList, ...this.objectList].map((o) => o.load()));
  }

  async play() {
    await this.load();
    [...this.tileList, ...this.objectList].forEach((obj) => {
      this.container.addChild(obj.container);
    });

    const next = await this.take();
    return next;
  }

  /**
   * @param {import('../object').IObject} object
   */
  removeObject(object) {
    if (!this.objectList.includes(object)) {
      return;
    }
    this.objectList = this.objectList.filter((each) => each !== object);
    this.container.removeChild(object.container);
  }

  /**
   * @param {import('../object').IObject} object
   */
  addObject(object) {
    if (!object.isLoaded()) {
      throw new Error(`'${object.name}' object is not loaded.`);
    }
    if (this.objectList.includes(object)) {
      return;
    }
    this.objectList.push(object);
    this.container.addChild(object.container);
  }

  /**
   * @param {import('../object').IObject} target
   * @param {number} [speed]
   */
  focus(target, speed) {
    const { x, y } = target.getCenterPosition();
    return this.#camera.moveTo(x, y, speed);
  }

  /**
   * @param {import('../object').IObject} object
   * @param {number} deltaX
   * @returns
   */
  getNextX(object, deltaX) {
    const {
      x, y, z, w, h,
    } = object.getArea();
    const destX = x + deltaX;
    const blocking = this.objectList.find((each) => {
      if (each === object || each.getPosition().z !== z) {
        return false;
      }
      return !!getOverlappingArea({
        x: destX, y, w, h,
      }, each.getArea());
    });
    if (blocking) {
      const { x: blockingX, w: blockingW } = blocking.getArea();
      return x < blockingX ? blockingX - w : blockingX + blockingW;
    }
    return destX;
  }

  /**
   * @param {import('../object').IObject} object
   * @param {number} deltaY
   * @returns
   */
  #getNextY(object, deltaY) {
    const {
      x, y, z, w, h,
    } = object.getArea();
    const destY = y + deltaY;
    const blocking = this.objectList.find((each) => {
      if (each === object || each.getPosition().z !== z) {
        return false;
      }
      return !!getOverlappingArea({
        x, y: destY, w, h,
      }, each.getArea());
    });
    if (blocking) {
      const { y: blockingY, h: blockingH } = blocking.getArea();
      return y < blockingY ? blockingY - h : blockingY + blockingH;
    }
    return destY;
  }

  /**
   * @param {import('../object').IObject} target
   * @param {number} deltaX
   * @param {number} deltaY
   */
  #move(target, deltaX, deltaY) {
    const {
      x: curX, y: curY, w, h,
    } = target.getArea();
    const nextX = this.getNextX(target, deltaX);
    const nextY = this.#getNextY(target, deltaY);
    target.setPosition(nextX, nextY);
    target.changeDirection(getDirectionByDelta(deltaX, deltaY));

    this.tileList
      .forEach((tile) => {
        if (tile.hasHandler('in')) {
          const tileArea = tile.getArea();
          const beforeIn = getOverlappingArea(tileArea, {
            x: curX, y: curY, w, h,
          });
          const afterIn = getOverlappingArea(tileArea, {
            x: nextX, y: nextY, w, h,
          });
          if (!beforeIn && afterIn) {
            tile.emit('in', { target });
          }
        }
        if (tile.hasHandler('out')) {
          const tileArea = tile.getArea();
          const beforeIn = getOverlappingArea(tileArea, {
            x: curX, y: curY, w, h,
          });
          const afterIn = getOverlappingArea(tileArea, {
            x: nextX, y: nextY, w, h,
          });
          if (beforeIn && !afterIn) {
            tile.emit('out', { target });
          }
        }
      });
  }

  /**
   * @param {import('../object').IObject} target} target
   * @param {boolean} [interrupted]
   * @returns
   */
  stopObject(target, interrupted) {
    const movementStop = this.#movementStopMap.get(target);
    if (!movementStop) {
      return;
    }
    target.stop();
    IApplication.get().ticker.remove(movementStop.tick);
    movementStop.resolve(interrupted || false);
    this.#movementStopMap.delete(target);
  }

  /**
   * @param {import('../object').IObject} target
   * @param {import('../utils/coordinates').Position} pos
   * @param {Object} [options]
   * @param {number} [options.speed]
   * @param {boolean} [options.focusing]
   */
  moveObject(target, pos, options) {
    return new Promise((resolve) => {
      const speed = options?.speed ?? 1;

      this.stopObject(target);

      const tick = () => {
        const { x: curX, y: curY } = target.getPosition();
        const diffX = pos.x - curX;
        const diffY = pos.y - curY;
        const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
        const arrived = distance < speed;

        if (arrived) {
          target.setPosition(pos.x, pos.y);
        } else {
          const deltaX = speed * (diffX / distance);
          const deltaY = speed * (diffY / distance);
          this.#move(target, deltaX, deltaY);
          target.play({ speed });
          if (options?.focusing) {
            this.focus(target);
          }
        }

        if (arrived) {
          this.stopObject(target);
        }
      };
      target.play({ speed });
      this.#movementStopMap.set(target, { tick, resolve });
      IApplication.get().ticker.add(tick);
    });
  }

  /**
   * @param {import('../object').ICharacter} player
   */
  control(player) {
    this.#controller.control();
    this.#controller.on('move', (evt) => {
      this.#move(player, evt.detail.deltaX, evt.detail.deltaY);
      this.focus(player);
      player.play(evt.detail.delta_level);
    });
    this.#controller.on('stop', () => {
      player.stop();
    });
    this.focus(player);
  }

  /**
   * @param {import('../utils/coordinates').Area} area
   */
  getOverlappingObjectList(area) {
    return this.objectList
      .filter((o) => !!this.getOverlappingArea(o.getArea(), area));
  }

  /**
     * @param {import('../object').ICharacter} speaker
     * @param {string} message
     * @returns
    */
  showMessage(speaker, message) {
    return this.#messenger.showMessage({
      speaker,
      message,
    });
  }
}

export default IScene;
