import { Container } from 'pixi.js';
import IApplication from '../application';
import ICamera from './camera';
import { wait } from '../utils';
import IMessenger from './messenger';
import { getDirectionByDelta, getOverlappingArea } from '../utils/coordinates';
import IController from './controller';

const IScene = {
  /**
   * @param {Object} param
   * @param {string} [param.name]
   * @param {import('../object').IObjectCreated[]} [param.objectList]
   */
  create: ({
    name: _name,
    objectList: _objectList,
  }) => {
    const name = _name;
    const container = new Container();
    const camera = ICamera.create(container);
    const controller = IController.create();
    const messenger = IMessenger.create();
    const movementStopMap = new WeakMap();

    /** @type {import('../object/type').IObjectCreated[]} */
    let objectList = [..._objectList || []];

    /** @type {(() => Promise<void>)[]} */
    const takeList = [];

    container.sortableChildren = true;

    const play = () => Promise.all(objectList.map((obj) => obj.load())) // load object list
      .then(() => {
        // draw map
        objectList.forEach((obj) => {
          container.addChild(obj.container);
        });
        IApplication.get().stage.addChild(container);
        return Promise.resolve();
      })
      .then(() => takeList.reduce((last, current) => last.then(() => current()), Promise.resolve()))
      .then(() => {
        console.error('end!!');
      });

    /**
     * @param {() => Promise<void>} take
     */
    const addTake = (take) => {
      takeList.push(take);
    };

    /**
     * @param {import('../object/type').IObjectCreated} object
     */
    const removeObject = (object) => {
      if (!objectList.includes(object)) {
        throw new Error(`[scene.remove_object] no object. ${object.name}`);
      }
      objectList = objectList.filter((each) => each !== object);
      container.removeChild(object.container);
    };

    /**
     * @param {import('../object/type').IObjectCreated} object
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
     * @param {import('../object/type').IObjectCreated} target
     * @param {number} [speed]
     */
    const focus = (target, speed) => {
      const { x, y } = target.getCenterPosition();
      return camera.moveTo(x, y, speed);
    };

    /**
     * @param {import('../object/type').IObjectCreated} object
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
     * @param {import('../object/type').IObjectCreated} object
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
     * @param {import('../object/type').IObjectCreated} target
     * @param {number} deltaX
     * @param {number} deltaY
     */
    const move = (target, deltaX, deltaY) => {
      const nextX = getNextX(target, deltaX);
      const nextY = getNextY(target, deltaY);
      target.setPosition(nextX, nextY);
      target.setDirection(getDirectionByDelta(deltaX, deltaY));
    };

    /**
     * @param {import('../object/type').IObjectCreated} target} target
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
     * @param {import('../object/type').IObjectCreated} target
     * @param {import('../utils/coordinates/type').Position} pos
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
     * @param {import('../object/character/type').ICharacterCreated} player
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
     * @param {import('../utils/coordinates/type').Area} area
     */
    const getOverlappingObjectList = (area) => objectList
      .filter((object) => !!getOverlappingArea(object.getArea(), area));

    /**
     * @param {import('../object/character/type').ICharacterCreated} speaker
     * @param {string} message
     * @returns
     */
    const showMessage = (speaker, message) => messenger.showMessage({
      speaker,
      message,
    });

    return Object.freeze({
      name,
      container,
      play,
      addTake,
      removeObject,
      addObject,
      focus,
      moveObject,
      stopObject,
      showMessage,
      control,
      getOverlappingObjectList,

      wait,
    });
  },
};

export default IScene;
