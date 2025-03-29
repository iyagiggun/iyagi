import { IMT } from '../../const/message.js';

export class ShardSceneMessage {

  #objects;

  /**
   * @param {import('../../object/iobject.js').IObject[]} objects
   */
  constructor(objects) {
    this.#objects = objects;
  }

  /**
   * @param {string | { serial: string }} target
   */
  #find(target) {
    const serial = typeof target === 'string' ? target :  target.serial;
    const t = this.#objects.find((obj) => obj.serial === serial);
    if (!t) {
      throw new Error('Fail to find target object data.');
    }
    return t;
  }

  /**
   * @param {string | { serial: string }} target
   * @param {number} speed
   */
  focus(target, speed = 0) {
    const t = this.#find(target);
    const hitbox = t.hitbox;
    t.hitbox;
    return {
      type: IMT.SCENE_FOCUS,
      data: {
        x: t.x + (hitbox ? hitbox.w/2 : 0),
        y: t.y + (hitbox ? hitbox.h/2 : 0),
        speed: speed,
      },
    };
  }
}
