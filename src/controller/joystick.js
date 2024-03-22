import { throttle } from 'lodash-es';

/**
 * @typedef JoystickInfo
 * @property {import('pixi.js').DisplayObject} layer
 * @property {import('../utils/coordinates').Position} start
 * @property {number} pointerId
 * @property {import('../object/character').ICharacter} player
 */

/** @type {JoystickInfo | null} */
let info = null;

/**
 * @param {number} distance
 * @returns
 */
export const calcSpeed = (distance) => {
  if (distance < 24) {
    return 0;
  }
  if (distance < 48) {
    return 1;
  }
  if (distance < 72) {
    return 2;
  }
  return 3;
};

let deltaX = 0;
let deltaY = 0;

const onTouchMove = throttle((evt) => {
  if (!info || evt.pointerId !== info.pointerId) {
    return;
  }
  const { x, y } = evt.global;
  const { player } = info;
  const diffX = x - info.start.x;
  const diffY = y - info.start.y;
  const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
  if (distance === 0) {
    return;
  }
  const speed = calcSpeed(distance);
  if (speed === 0) {
    deltaX = 0;
    deltaY = 0;
    player.stop();
    return;
  }
  deltaX = Math.round((diffX * speed) / distance);
  deltaY = Math.round((diffY * speed) / distance);
  player.play({ speed });
}, 50);

const tick = () => {
  if (!info) {
    return;
  }
  info.player.scene?.objects.move(info.player, { x: deltaX, y: deltaY });
  info.player.scene?.camera.pointTo(info.player);
};

const Joystick = {
  /**
   * @param {JoystickInfo} _info
   */
  activate: (_info) => {
    info = _info;
    info.layer.addEventListener('touchmove', onTouchMove);
    info.player.application().ticker.add(tick);
  },
  /**
   * @param {number} pointerId
   */
  release: (pointerId) => {
    if (!info || pointerId !== info.pointerId) {
      return;
    }
    info.player.application().ticker.remove(tick);
    info.layer.removeEventListener('touchmove', onTouchMove);
    info.player.stop();
    info = null;
  },
};

export { Joystick };
