import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import global from '../global/index.js';

let isTalking = false;

const NAME_STYLE = new TextStyle({
  fontSize: 24,
  fontStyle: 'italic',
  fontWeight: 'bold',
  fill: 0xffffff,
});

const container = new Container();
const bg = new Graphics();
const token = new Text({ text: '' });
const name = new Text({ text: '', style: NAME_STYLE });

/**
 * @param {number} width
 * @returns
 */
const getMessageStyle = (width) => new TextStyle({
  fontFamily: 'Arial',
  fontSize: 22,
  wordWrap: true,
  wordWrapWidth: width,
  fill: 0xffffff,
});

/**
 * @param {import('./index.js').MessageShowParams} p
 * @returns {Promise<void>}
 */
const show = ({ name: _name, message, portrait }) => {
  isTalking = true;

  const application = global.app;
  const appWidth = application.screen.width;
  const appHeight = application.screen.height;

  bg.clear();
  bg.rect(0, 0, appWidth, Math.min(150, appHeight / 2 - 48));
  bg.fill({ color: 0x000000, alpha: 0.7 });
  bg.x = 0;
  bg.y = appHeight - bg.height;
  container.addChild(bg);

  name.text = _name + ' ';

  if (portrait) {
    const photoSize = Math.min(144, Math.min(appWidth, appHeight) / 2 - 64);
    portrait.width = photoSize;
    portrait.height = photoSize;
    portrait.y = bg.y - photoSize;
    container.addChild(portrait);
  }
  name.x = 12;
  name.y = bg.y + 6;
  container.addChild(name);

  token.style = getMessageStyle(bg.width - 36);
  token.x = 12;
  token.y = name.y + name.height + 6;
  container.addChild(token);

  const textList = Array.isArray(message) ? message : [message];
  let listIdx = 0;
  let msgStartIdx = 0;
  let msgEndIdx = 0;
  let isMsgOverflowed = false;

  const showPartedMessage = () => {
    const msg = textList[listIdx];
    while (msgEndIdx <= msg.length && !isMsgOverflowed) {
      msgEndIdx += 1;
      token.text = msg.substring(msgStartIdx, msgEndIdx);
      if (bg.height > heightThreshold) {
        isMsgOverflowed = true;
        msgEndIdx -= 1;
      }
    }
    if (msgEndIdx - 1 === msg.length) {
      listIdx += 1;
      msgStartIdx = 0;
      msgEndIdx = 0;
      isMsgOverflowed = false;
    }
  };

  const heightThreshold = bg.height;

  application.stage.addChild(container);

  return new Promise((resolve) => {
    container.eventMode = 'static';
    showPartedMessage();
    /**
     * @param {import('pixi.js').FederatedPointerEvent} evt
     */
    const handler = (evt) => {
      evt.stopPropagation();
      if (listIdx >= textList.length) {
        application.stage.removeChild(container);
        container.off('pointertap', handler);
        if (portrait) {
          container.removeChild(portrait);
        }
        isTalking = false;
        resolve();
      } else {
        showPartedMessage();
      }
    };
    container.on('pointertap', handler);
  });
};

const imessenger = {
  show,
  /**
   * @readonly
   */
  get isTalking() {
    return isTalking;
  },
};

export default imessenger;
