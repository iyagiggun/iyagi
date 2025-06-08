import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import global from '../global/index.js';

export const TRANSPARENT_1PX_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5QkWDxoxGJD3fwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAALSURBVAjXY2AAAgAABQAB4iYFmwAAAABJRU5ErkJggg==';

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
  fontSize: 24,
  // fontSize: 18,
  wordWrap: true,
  wordWrapWidth: width,
  fill: 0xffffff,
});

/**
 * @param {import('./index.js').MessageShowParams} p
 */
const show = ({ name: _name, message, portrait }) => {

  const application = global.app;
  const appWidth = application.screen.width;
  const appHeight = application.screen.height;

  bg.clear();
  bg.rect(0, 0, appWidth, appHeight / 2 - 48);
  bg.fill({ color: 0x000000, alpha: 0.7 });
  bg.x = 0;
  bg.y = appHeight - bg.height;
  container.addChild(bg);

  name.text = _name;

  if (portrait) {
    const photoSize = Math.min(144, Math.min(appWidth, appHeight) / 2);
    portrait.width = photoSize;
    portrait.height = photoSize;
    portrait.x = 12;
    portrait.y = bg.y + bg.height - photoSize - 12;
    container.addChild(portrait);

    name.x = portrait.x + portrait.width + 12;
    name.y = bg.y + 6;
    container.addChild(name);
    token.style = getMessageStyle(bg.width - photoSize - 36);
    token.x = portrait.x + portrait.width + 12;
    token.y = name.y + name.height + 6;
    container.addChild(token);
  } else {
    name.x = 12;
    name.y = bg.y + 6;
    container.addChild(name);

    token.style = getMessageStyle(bg.width - 36);
    token.x = 12;
    token.y = name.y + name.height + 6;
    container.addChild(token);
  }

  /** @type {string[]} */
  const textList = [].concat(message);
  let listIdx = 0;
  let msgStartIdx = 0;
  let msgEndIdx = 0;
  let isMsgOverflowed = false;

  const showPartedMessage = () => {
    const msg = textList[listIdx];
    while(msgEndIdx <= msg.length && !isMsgOverflowed) {
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
    const handler = (evt) => {
      evt.stopPropagation();
      if (listIdx >= textList.length) {
        application.stage.removeChild(container);
        container.off('pointertap', handler);
        container.removeChild(portrait);
        resolve(undefined);
      } else {
        showPartedMessage();
      }
    };
    container.on('pointertap', handler);
  });
};

const imessenger = {
  show,
};

export default imessenger;
