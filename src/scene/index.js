import { Container } from 'pixi.js';
import IApplication from '../application';
import ICamera from './camera';
import { wait } from '../utils';
import IMessenger from './messenger';
import { getDirectionByDelta, isOverlap } from '../utils/coordinates';
import IController from './controller';

const IScene = {
  /**
   * @param {Object} param
   * @param {string} [param.name]
   * @param {import('../object/type').IObjectCreated[]} [param.objectList]
   */
  create: ({
    name: _name,
    objectList: _objectList,
  }) => {
    const name = _name;
    const container = new Container();
    const app = IApplication.get();
    const camera = ICamera.create(container);
    const controller = IController.create();
    const messenger = IMessenger.create();

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
        app.stage.addChild(container);
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
        return isOverlap({
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
        return isOverlap({
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
     * @param {import('../object/type').IObjectCreated} target
     * @param {number} x
     * @param {number} y
     * @param {Object} [options]
     * @param {number} [options.speed]
     * @param {boolean} [options.focusing]
     */
    const moveObject = (target, x, y, options) => new Promise((resolve) => {
      const { ticker } = app;
      const speed = options?.speed ?? 1;
      const tick = () => {
        const { x: curX, y: curY } = target.getPosition();
        const diffX = x - curX;
        const diffY = y - curY;
        const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
        const arrived = distance < speed;

        if (arrived) {
          target.setPosition(x, y);
        } else {
          const deltaX = speed * (diffX / distance);
          const deltaY = speed * (diffY / distance);
          move(target, deltaX, deltaY);
          target.play(speed);
          if (options?.focusing) {
            focus(target);
          }
        }

        if (arrived) {
          ticker.remove(tick);
          target.stop();
          resolve(undefined);
        }
      };
      target.play(speed);
      ticker.add(tick);
    });

    /**
     *
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
      play,
      addTake,
      removeObject,
      addObject,
      focus,
      moveObject,
      showMessage,
      control,

      wait,
    });
  },
};

export default IScene;
