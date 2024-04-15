import { TRANSPARENT_1PX_IMG } from '../utils';

const {
  Graphics, TextStyle, Text,
  Sprite,
} = require('pixi.js');

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
  fill: [0xffffff, 0xaaaaaa],
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
    const appWidth = application.view.width;
    const appHeight = application.view.height;

    const messageBox = new Graphics();
    messageBox.beginFill(0x000000, 0.7);
    messageBox.drawRect(0, 0, appWidth, appHeight / 2 - 48);
    messageBox.endFill();
    messageBox.x = 0;
    messageBox.y = appHeight - messageBox.height;

    const upper = Sprite.from(TRANSPARENT_1PX_IMG);
    upper.width = appWidth;
    upper.height = appHeight - messageBox.height;
    upper.x = 0;
    upper.y = 0;
    upper.eventMode = 'static';

    const { photo } = speaker;
    const name = new Text(speaker.name, NAME_STYLE);
    const text = new Text('');

    if (photo) {
      const photoSize = Math.min(144, Math.min(appWidth, appHeight) / 2);
      photo.width = photoSize;
      photo.height = photoSize;
      photo.x = 12;
      photo.y = messageBox.height - photoSize - 12;
      messageBox.addChild(photo);

      name.x = photo.x + photo.width + 12;
      name.y = 6;
      messageBox.addChild(name);

      text.style = getMessageStyle(messageBox.width - photoSize - 36);
      text.x = photo.x + photo.width + 12;
      text.y = name.y + name.height + 6;
      messageBox.addChild(text);
    } else {
      name.x = 12;
      name.y = 6;
      messageBox.addChild(name);

      text.style = getMessageStyle(messageBox.width - 36);
      text.x = 12;
      text.y = name.y + name.height + 6;
      messageBox.addChild(text);
    }

    const messageIdxLimit = message.length;
    let messageStartIdx = 0;
    let messageEndIdx = 0;
    let isMessageOverflowed = false;

    const heightThreshold = messageBox.height;
    const showPartedMessage = () => {
      while (messageEndIdx <= messageIdxLimit && !isMessageOverflowed) {
        messageEndIdx += 1;
        text.text = message.substring(messageStartIdx, messageEndIdx);
        if (messageBox.height > heightThreshold) {
          isMessageOverflowed = true;
          messageEndIdx -= 1;
        }
      }
      isMessageOverflowed = false;
      messageStartIdx = messageEndIdx;
    };

    application.stage.addChild(upper);
    application.stage.addChild(messageBox);

    showPartedMessage();

    return new Promise((resolve) => {
      messageBox.eventMode = 'static';
      messageBox.addEventListener('touchstart', (evt) => {
        evt.stopPropagation();
        if (messageEndIdx > messageIdxLimit) {
          application.stage.removeChild(upper);
          application.stage.removeChild(messageBox);
          resolve(undefined);
        } else {
          showPartedMessage();
        }
      });
    });
  },
};

export { imessenger };
