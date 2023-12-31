import { Container } from 'pixi.js';
import IApplication from '../application';
import { wait } from '../utils';
import { getDirectionByDelta, getOverlappingArea } from '../utils/coordinates';
import ICamera from './camera';
import IController from './controller';
import IMessenger from './messenger';

/**
 * @typedef {ReturnType<typeof IScene.create>} ISceneCreated
 */

const IScene = {
  /**
   * @param {Object} param
   * @param {string} [param.name]
   * @param {import('../object').ITile[]} param.tileList
   * @param {import('../object').IObject[]} [param.objectList]
   * @param {() => Promise<ISceneCreated | null>} param.take
   */
  create: ({
    name: _name,
    tileList,
    objectList: _objectList,
    take,
  }) => {
    const name = _name;
    const container = new Container();
    const camera = ICamera.create(container);
    const controller = IController.create();
    const messenger = IMessenger.create();
    const movementStopMap = new WeakMap();

    /** @type {import('../object').IObject[]} */
    let objectList = [..._objectList || []];

    container.sortableChildren = true;

    const load = () => Promise.all([...tileList, ...objectList].map((obj) => obj.load()));

    const play = async () => {
      await load();
      [...tileList, ...objectList].forEach((obj) => {
        container.addChild(obj.container);
      });

      const next = await take();
      return next;
    };

    /**
     * @param {import('../object').IObject} object
     */
    const removeObject = (object) => {
      if (!objectList.includes(object)) {
        throw new Error(`[scene.remove_object] no object. ${object.name}`);
      }
      objectList = objectList.filter((each) => each !== object);
      container.removeChild(object.container);
    };

    /**
     * @param {import('../object').IObject} object
     */
    const addObject = (object) => {
      if (!object.isLoaded()) {
        throw new Error(`'${name}' object is not loaded.`);
      }
      if (objectList.includes(object)) {
        return;
      }
      objectList.push(object);
      container.addChild(object.container);
    };

    /**
     * @param {import('../object').IObject} target
     * @param {number} [speed]
     */
    const focus = (target, speed) => {
      const { x, y } = target.getCenterPosition();
      return camera.moveTo(x, y, speed);
    };

    /**
     * @param {import('../object').IObject} object
     * @param {number} deltaX
     * @returns
     */
    const getNextX = (object, deltaX) => {
      const {
        x, y, z, w, h,
      } = object.getArea();
      const destX = x + deltaX;
      const blocking = objectList.find((each) => {
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
    };

    /**
     * @param {import('../object').IObject} object
     * @param {number} deltaY
     * @returns
     */
    const getNextY = (object, deltaY) => {
      const {
        x, y, z, w, h,
      } = object.getArea();
      const destY = y + deltaY;
      const blocking = objectList.find((each) => {
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
    };

    /**
     * @param {import('../object').IObject} target
     * @param {number} deltaX
     * @param {number} deltaY
     */
    const move = (target, deltaX, deltaY) => {
      const {
        x: curX, y: curY, w, h,
      } = target.getArea();
      const nextX = getNextX(target, deltaX);
      const nextY = getNextY(target, deltaY);
      target.setPosition(nextX, nextY);
      target.setDirection(getDirectionByDelta(deltaX, deltaY));

      tileList
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
    };

    /**
     * @param {import('../object').IObject} target} target
     * @param {boolean} [interrupted]
     * @returns
     */
    const stopObject = (target, interrupted) => {
      const movementStop = movementStopMap.get(target);
      if (!movementStop) {
        return;
      }
      target.stop();
      IApplication.get().ticker.remove(movementStop.tick);
      movementStop.resolve(interrupted || false);
      movementStopMap.delete(target);
    };

    /**
     * @param {import('../object').IObject} target
     * @param {import('../utils/coordinates').Position} pos
     * @param {Object} [options]
     * @param {number} [options.speed]
     * @param {boolean} [options.focusing]
     */
    const moveObject = (target, pos, options) => new Promise((resolve) => {
      const speed = options?.speed ?? 1;

      stopObject(target);

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
          move(target, deltaX, deltaY);
          target.play({ speed });
          if (options?.focusing) {
            focus(target);
          }
        }

        if (arrived) {
          stopObject(target);
        }
      };
      target.play({ speed });
      movementStopMap.set(target, { tick, resolve });
      IApplication.get().ticker.add(tick);
    });

    /**
     * @param {import('../object/character').ICharacterCreated} player
     */
    const control = (player) => {
      controller.control();
      controller.on('move', (evt) => {
        move(player, evt.detail.deltaX, evt.detail.deltaY);
        focus(player);
        player.play(evt.detail.delta_level);
      });
      controller.on('stop', () => {
        player.stop();
      });
      focus(player);
    };

    /**
     * @param {import('../utils/coordinates').Area} area
     */
    const getOverlappingObjectList = (area) => objectList
      .filter((object) => !!getOverlappingArea(object.getArea(), area));

    /**
     * @param {import('../object/character').ICharacterCreated} speaker
     * @param {string} message
     * @returns
     */
    const showMessage = (speaker, message) => messenger.showMessage({
      speaker,
      message,
    });

    const ret = {
      name,
      container,
      play,
      removeObject,
      addObject,
      focus,
      moveObject,
      stopObject,
      showMessage,
      control,
      getOverlappingObjectList,

      wait,
    };

    return Object.freeze(ret);
  },
};

export default IScene;
