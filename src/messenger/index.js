import {
  Container, Graphics, Sprite, TextStyle, Text,
} from 'pixi.js';
import { TRANSPARENT_1PX_IMG } from '../utils';

const NAME_STYLE = new TextStyle({
  fontSize: 24,
  fontStyle: 'italic',
  fontWeight: 'bold',
  fill: 0xffffff,
});

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
 * @typedef Speaker
 * @property {import('pixi.js').Sprite} [photo]
 * @property {string} name
 */

const imessenger = {
  /**
   * @param {Object} p
   * @param {import('pixi.js').Application} p.application
   * @param {Speaker} p.speaker
   * @param {string} p.message
   */
  talk: async ({
    application,
    speaker,
    message,
  }) => {
    const appWidth = application.screen.width;
    const appHeight = application.screen.height;

    const container = new Container();
    container.width = appWidth;
    container.height = appHeight;

    const bg = new Graphics();
    bg.rect(0, 0, appWidth, appHeight / 2 - 48);
    bg.fill({ color: 0x000000, alpha: 0.7 });
    bg.x = 0;
    bg.y = appHeight - bg.height;
    container.addChild(bg);

    const upper = Sprite.from(TRANSPARENT_1PX_IMG);
    upper.width = appWidth;
    upper.height = appHeight - bg.height;
    upper.x = 0;
    upper.y = 0;
    upper.eventMode = 'static';

    const { photo } = speaker;
    const name = new Text({ text: speaker.name, style: NAME_STYLE });
    const text = new Text({ text: '' });

    if (photo) {
      const photoSize = Math.min(144, Math.min(appWidth, appHeight) / 2);
      photo.width = photoSize;
      photo.height = photoSize;
      photo.x = 12;
      photo.y = bg.y + bg.height - photoSize - 12;
      container.addChild(photo);

      name.x = photo.x + photo.width + 12;
      name.y = bg.y + 6;
      container.addChild(name);
      text.style = getMessageStyle(bg.width - photoSize - 36);
      text.x = photo.x + photo.width + 12;
      text.y = name.y + name.height + 6;
      container.addChild(text);
    } else {
      name.x = 12;
      name.y = bg.y + 6;
      container.addChild(name);

      text.style = getMessageStyle(bg.width - 36);
      text.x = 12;
      text.y = name.y + name.height + 6;
      container.addChild(text);
    }

    const messageIdxLimit = message.length;
    let messageStartIdx = 0;
    let messageEndIdx = 0;
    let isMessageOverflowed = false;

    const heightThreshold = bg.height;
    const showPartedMessage = () => {
      while (messageEndIdx <= messageIdxLimit && !isMessageOverflowed) {
        messageEndIdx += 1;
        text.text = message.substring(messageStartIdx, messageEndIdx);
        if (bg.height > heightThreshold) {
          isMessageOverflowed = true;
          messageEndIdx -= 1;
        }
      }
      isMessageOverflowed = false;
      messageStartIdx = messageEndIdx;
    };

    application.stage.addChild(upper);
    application.stage.addChild(container);

    showPartedMessage();

    return new Promise((resolve) => {
      container.eventMode = 'static';
      container.on('pointertap', (evt) => {
        evt.stopPropagation();
        if (messageEndIdx > messageIdxLimit) {
          application.stage.removeChild(upper);
          application.stage.removeChild(container);
          resolve(undefined);
        } else {
          showPartedMessage();
        }
      });
    });
  },
};

export { imessenger };
