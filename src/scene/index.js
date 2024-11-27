import { IMT } from '../const/message.js';
import { getDirectionByDelta, getNextPosition } from '../coords/index.js';
import global from '../global.js';

/**
 * @typedef {Object} Object
 * @property {string} name
 * @property {import('../coords/index.js').Area=} hitbox
 * @property {import('../coords/index.js').Position} position
 */

/**
 * @typedef {Object} SceneParams
 * @property {string} key
 * @property {Object[]} objects
 * @property {function(import('../user/index.js').User): *} onLoaded
 */

export default class Scene {
  objects;

  /**
   * @param {SceneParams} p
   */
  constructor({
    key,
    objects,
    onLoaded,
  }) {
    this.key = key;
    this.objects = objects;
    this.onLoaded = onLoaded;
  }
}

/**
 * @param {Object} p
 * @param {import('../user/index.js').User} p.user
 * @param {string} p.type
 * @param {*} p.data
 * @returns
 */
export const onSceneEvent = ({ user, type, data }) => {
  switch(type) {
    case IMT.SCENE_LOAD:
    {
      const scene = global.scene.find(data.scene);
      user.scene = scene.key;
      user.objects = JSON.parse(JSON.stringify(scene.objects));
      return {
        type: IMT.SCENE_LOAD,
        data: { objects: [...scene.objects] },
      };
    }
    case IMT.SCENE_LOADED:
    {
      const scene = global.scene.find(data.scene);
      return scene.onLoaded(user);
    }
    case IMT.SCENE_MOVE:
    {
      const target = user.objects.find((o) => o.name === data.target);
      if (!target) {
        throw new Error(`Fail to move. No target (${data.target}).`);
      }
      const next_position = getNextPosition({ target, objects: user.objects, destination: data.position });
      const direction = getDirectionByDelta(target.position, next_position);
      if (next_position) {
        target.position = next_position;
        return {
          type: IMT.SCENE_MOVE,
          data: {
            target: data.target,
            direction,
            position: next_position,
          },
        };
      }
      return null;
    }
    case IMT.SCENE_INTERACT:
    {
      const target = user.objects.find((o) => o.name === data.target);

      // const interactionArea = (() => {
      //   const {
      //     x, y, w, h,
      //   } = this.area();
      //   switch (this.direction()) {
      //     case 'up':
      //       return {
      //         x, y: y - 5, w, h: h + 5,
      //       };
      //     case 'down':
      //       return {
      //         x, y, w, h: h + 5,
      //       };
      //     case 'left':
      //       return {
      //         x: x - 5, y, w: w + 5, h,
      //       };
      //     case 'right':
      //       return {
      //         x, y, w: w + 5, h,
      //       };
      //     default:
      //       throw new Error('Invalid direction.');
      //   }
      // })();

      console.error(target);
      return null;
      // console.error(user.objects);
    }
  }
};
