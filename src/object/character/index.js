import { Assets, Sprite } from 'pixi.js';
import { IObject } from '..';
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
    const messenger = this.scene?.iyagi?.messenger;
    if (!messenger) {
      throw new Error('No messanger');
    }
    return messenger.talk({
      application: this.application(),
      speaker: {
        name: this.name,
        photo: this.photo(),
      },
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
        const { x: curX, y: curY } = this.xy;
        const diffX = pos.x - curX;
        const diffY = pos.y - curY;
        const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
        const arrived = distance < moveSpeed;

        if (arrived) {
          this.x = pos.x;
          this.y = pos.y;
        } else {
          const deltaX = moveSpeed * (diffX / distance);
          const deltaY = moveSpeed * (diffY / distance);
          scene.objects.move(this, { x: deltaX, y: deltaY });
          const { camera } = scene;
          if (options?.trace) {
            camera.point(this);
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

  interact() {
    if (!this.scene) {
      return Promise.resolve();
    }
    const interactionArea = (() => {
      const {
        x, y, w, h,
      } = this.area();
      switch (this.direction()) {
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
    const target = this.scene.objects.overlapped(interactionArea).find((o) => !!o.interaction);
    return target?.interaction?.() || Promise.resolve();
  }
}

export { ICharacter };
