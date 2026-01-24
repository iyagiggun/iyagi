
/**
 * @typedef SpriteImage
 * @property {string} url
 * @property {number} [scale]
 */

/**
 * @typedef ActionArea
 * @property {SpriteImage} [image]
 * @property {import('@iyagi/commons/coords').XYWH} [hitbox]
 * @property {import('@iyagi/commons/coords').XYWH} [shadow]
 * @property {import('@iyagi/commons/coords').XYWH[]} frames
 */

/**
 * @typedef Motion
 * @property {SpriteImage} [image]
 * @property {boolean} [loop]
 * @property {ActionArea} [up]
 * @property {ActionArea} [down]
 * @property {ActionArea} [left]
 * @property {ActionArea} [right]
 * @property {boolean=} playing
 * @property {import('@iyagi/commons/coords').XYWH} [hitbox]
 * @property {import('@iyagi/commons/coords').XYWH} [shadow]
 */

/**
 * @typedef SpriteInfo
 * @property {SpriteImage} image
 * @property {{[key: string]: Motion}} motions
 * @property {{ x?: number, y?: number }} [offset]
 * @property {import('@iyagi/commons/coords').XYWH} [hitbox]
 * @property {import('@iyagi/commons/coords').XYWH} [shadow]
 */

/**
 * @typedef ObjectResourceData
 * @property {SpriteInfo} sprite
 * @property {import('@iyagi/commons/coords').Shape} shape
 */

/**
 * @type {Set<string>}
 */
const RESOURCE_KEY_SET = new Set();

/**
 * @param {import('@iyagi/commons/coords').Shape} shape
 */
const calcOffset = (shape) => {
  if ('radius' in shape) {
    return { x: shape.radius, y: shape.radius };
  }
  if ('halfW' in shape && 'halfH' in shape) {
    return { x: shape.halfW, y: shape.halfH };
  }
  throw new Error('invalid shape');
};

export class ServerObjectResource {
  #key;
  /**
   * @param {string} key
   * @param {ObjectResourceData} data
   */
  constructor(key, data) {
    if (RESOURCE_KEY_SET.has(key)) {
      throw new Error(`Resource key "${key}" already exists.`);
    }
    RESOURCE_KEY_SET.add(key);
    this.#key = key;

    const offsetByShape = calcOffset(data.shape);
    this.data = {
      ...data,
      sprite: {
        ...data.sprite,
        offset: {
          x: data.sprite.offset?.x || offsetByShape.x,
          y: data.sprite.offset?.y || offsetByShape.y,
        },
      },
    };
  }

  get key() {
    return this.#key;
  }

  toClientData() {
    return {
      key: this.key,
      sprite: this.data.sprite,
    };
  }
}
