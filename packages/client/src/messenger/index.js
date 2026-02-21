
/**
 * @typedef {Object} MessageShowParams
 * @property {string} name
 * @property {string | string[]} message
 * @property {import('pixi.js').Sprite} [portrait]
 */

/**
 * @typedef {Object} Messenger
 * @property {function(MessageShowParams): Promise<void>} show
 * @property {boolean} isTalking
 */
