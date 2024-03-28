import { Assets, Sprite } from 'pixi.js';
import { IObject } from '..';
import messanger from '../../scene/messenger';
import { TRANSPARENT_1PX_IMG } from '../../utils';

const _movementStopMap = new WeakMap();

/**
 * @typedef {Object} AdditionalParameter
 * @property {Object<string, string>} [AdditionalParameter.photoMap]
 * - "default" key is required
 */

/**
 * @typedef {import('..').ObjectParameter & AdditionalParameter} CharacterParameter
 */

class ICharacter extends IObject {
  #photo = {
    key: 'default',
    /** @type {Object<string, import("pixi.js").Sprite>} */
    texture: {},
  };

  /** @type {CharacterParameter} */
  #p;

  /**
   * @param {CharacterParameter} p
   */
  constructor(p) {
    super(p);
    this.#p = p;
  }

  async load() {
    if (this.isLoaded()) {
      return;
    }
    const photoMap = this.#p.photoMap ?? { default: TRANSPARENT_1PX_IMG };
    const photoLoadPromises = Object.keys(photoMap).map(async (key) => {
      const photoUrl = photoMap[key];
      this.#photo.texture[key] = new Sprite(await Assets.load(photoUrl));
    });
    await Promise.all([super.load(), ...photoLoadPromises]);
  }

  /**
   * @param {string} message
   */
  talk(message) {
    return messanger.talk({
      speaker: this,
      message,
    });
  }

  photo() {
    return this.#photo.texture[this.#photo.key];
  }

  /**
   * @param {import('../../utils/coordinates').Position} pos
   * @param {Object} [options]
   * @param {number} [options.speed]
   * @param {boolean} [options.trace] camera follow
   * @returns
   */
  move(pos, options) {
    return new Promise((resolve) => {
      const { scene } = this;
      if (!scene) {
        throw new Error('No scene');
      }
      const speed = options?.speed ?? 1;
      const moveSpeed = speed * 2;

      const tick = () => {
        const { x: curX, y: curY } = this.position();
        const diffX = pos.x - curX;
        const diffY = pos.y - curY;
        const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
        const arrived = distance < moveSpeed;

        if (arrived) {
          this.positionAt({ x: pos.x, y: pos.y });
        } else {
          const deltaX = moveSpeed * (diffX / distance);
          const deltaY = moveSpeed * (diffY / distance);
          scene.objects.move(this, { x: deltaX, y: deltaY });
          const { camera } = scene;
          if (options?.trace) {
            camera.pointTo(this);
          }
        }

        if (arrived) {
          this.stop();
          const movementStop = _movementStopMap.get(this);
          if (movementStop) {
            this.application().ticker.remove(movementStop.tick);
            movementStop.resolve();
            _movementStopMap.delete(this);
          }
        }
      };

      this.stop();
      this.play({ speed });
      _movementStopMap.set(this, { tick, resolve });
      this.application().ticker.add(tick);
    });
  }
}

export { ICharacter };
