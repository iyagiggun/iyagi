import { Container } from 'pixi.js';
import IApplication from '../application';
import ICamera from './camera';
import { wait } from '../utils';

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
     * @param {import('../object/type').IObjectCreated} target
     */
    const removeObject = (target) => {
      if (!objectList.includes(target)) {
        throw new Error(`[scene.remove_object] no object. ${target.name}`);
      }
      objectList = objectList.filter((each) => each !== target);
      container.removeChild(target.container);
    };

    /**
     * @param {import('../object/type').IObjectCreated} target
     * @param {number} [speed = 1]
     */
    const focus = (target, speed = 1) => {
      const { x, y } = target.getCenterPosition();
      return camera.moveTo(x, y, speed);
    };

    return Object.freeze({
      name,
      play,
      addTake,
      removeObject,
      focus,

      wait,
    });
  },
};

export default IScene;
