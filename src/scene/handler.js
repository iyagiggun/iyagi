import { IMT } from '../const/message.js';
import { getDirectionByDelta, getNextPosition, isOverlap } from '../coords/index.js';
import global from '../global.js';

/**
 * @param {Object} p
 * @param {import('../user/index.js').default} p.user
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

      user.objects = scene.objects;

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
      const target = user.objects.find((o) => o.key === data.target);
      if (!target) {
        throw new Error(`Fail to move. No target (${data.target}).`);
      }
      const nextDirection = getDirectionByDelta(target.position, data.position);
      const nextPosition = getNextPosition({ target, objects: user.objects, destination: data.position });
      target.position = nextPosition;
      target.direction = nextDirection;
      return {
        type: IMT.SCENE_MOVE,
        data: {
          target: data.target,
          direction: nextDirection,
          position: nextPosition,
        },
      };
    }
    case IMT.SCENE_INTERACT:
    {
      const target = user.objects.find((o) => o.key === data.target);
      if (!target) {
        return;
      }

      const interactionArea = (() => {
        const hitbox = target.hitbox ?? { ...target.position, w: 0, h: 0 };
        const {
          x, y, w, h,
        } = hitbox;
        switch (target.direction) {
          case 'up':
            return {
              x, y: y - 5, w, h: h + 5,
            };
          case 'down':
            return {
              x, y, w, h: h + 5,
            };
          case 'left':
            return {
              x: x - 5, y, w: w + 5, h,
            };
          case 'right':
            return {
              x, y, w: w + 5, h,
            };
          default:
            throw new Error('Invalid direction.');
        }
      })();

      const willInteract = user.objects.find(
        (object) => object !== target && object.hitbox && isOverlap(object.hitbox, interactionArea)
      );
      if (!willInteract) {
        return;
      }
      console.error(willInteract);
      willInteract.interact?.(user);
      return null;
      // console.error(user.objects);
    }
  }
};
