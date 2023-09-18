import { Application, Container } from 'pixi.js';
import { ObjType } from '../object';
import { CharacterType } from '../object/character';
import { wait } from '../utils';
import { getDirectionByDelta, isOverlap } from '../utils/area';
import { create_camera } from './camera';
import { create_controller } from './controller';
import { create_messenger } from './messenger';

export type SceneParams = {
  name: string;
  objectList: ObjType[];
}

export const createScene = (app: Application, {
  // name,
  objectList: _objectList
}: SceneParams) => {
  const container = new Container;
  let objectList = _objectList.slice();
  const takeList: (() => Promise<void>)[] = [];
  // const event_target = new EventTarget();

  const camera = create_camera(app, container);
  const messenger = create_messenger(app);
  const controller = create_controller(app);

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
    .then(() => {
    // play each take
      return takeList.reduce((last, current) => {
        return last.then(() => {
          return current();
        });
      }, Promise.resolve());
    })
    .then(() => {
      console.error('end!!');
    });

  const add_take = (take: () => Promise<void>) => {
    takeList.push(take);
  };

  const focus = (target: ObjType, speed?: number) => {
    const { x, y } = target.getCenterPosition();
    return camera.move_to(x, y, speed);
  };

  const remove_object = (object: ObjType) => {
    if (!objectList.includes(object)) {
      throw new Error(`[scene.remove_object] no object. ${object.name}`);
    }
    objectList = objectList.filter((each) => each !== object);
    container.removeChild(object.container);
  };

  const add_object = (object: ObjType) => {
    if (objectList.includes(object)) {
      return;
    }
    objectList.push(object);
    container.addChild(object.container);
  };

  const show_message = (speaker: CharacterType, message: string) => messenger.show_message({
    speaker,
    message
  });

  const getNextX = (object: ObjType, deltaX: number) => {
    const { x, y, z, w, h } = object.getArea();
    const destX = x + deltaX;
    const blocking = objectList.find((each) => {
      if (each === object || each.getPosition().z !== z) {
        return false;
      }
      return isOverlap({ x: destX, y, w, h }, each.getArea());
    });
    if (blocking) {
      const { x: blockingX, w: blockingW } = blocking.getArea();
      return x < blockingX ? blockingX - w : blockingX + blockingW;
    }
    return destX;
  };

  const getNextY = (object: ObjType, deltaY: number) => {
    const { x, y, z, w, h } = object.getArea();
    const destY = y + deltaY;
    const blocking = objectList.find((each) => {
      if (each === object || each.getPosition().z !== z) {
        return false;
      }
      return isOverlap({ x, y: destY, w, h }, each.getArea());
    });
    if (blocking) {
      const { y: blockingY, h: blockingH } = blocking.getArea();
      return y < blockingY ? blockingY - h : blockingY + blockingH;
    }
    return destY;
  };

  const move = (target: ObjType, deltaX: number, deltaY:number) => {
    const next_x = getNextX(target, deltaX);
    const next_y = getNextY(target, deltaY);
    target.setPosition(next_x, next_y);
    target.setDirection(getDirectionByDelta(deltaX, deltaY));
  };

  const move_object = (target: ObjType, x: number, y: number, options?: {
    speed?: number
    focusing?: boolean
  }) => new Promise<void>((resolve) => {
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
        resolve();
      }
    };
    target.play(speed);
    ticker.add(tick);
  });

  const control = (player: CharacterType) => {
    controller.control();
    controller.on('move', (data) => {
      move(player, data.delta_x, data.delta_y);
      focus(player);
      player.play(data.delta_level);
    });
    controller.on('stop', () => {
      player.stop();
    });
    focus(player);
  };

  return Object.freeze({
    container,
    play,
    add_take,
    add_object,
    remove_object,
    show_message,
    focus,
    move_object,
    control,

    wait
  });
};

export type SceneType = ReturnType<typeof createScene>;
