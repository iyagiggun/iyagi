const {
  Graphics, TextStyle, Text,
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

    const wrapperWidth = appWidth;
    const wrapperHeight = appHeight / 2 - 48;

    const wrapper = new Graphics();
    wrapper.beginFill(0x000000, 0.7);
    wrapper.drawRect(0, 0, wrapperWidth, wrapperHeight);
    wrapper.endFill();
    wrapper.x = 0;
    wrapper.y = appHeight - wrapperHeight;

    const { photo } = speaker;
    const name = new Text(speaker.name, NAME_STYLE);
    const messageBox = new Text('');

    if (photo) {
      const photoSize = Math.min(144, Math.min(appWidth, appHeight) / 2);
      photo.width = photoSize;
      photo.height = photoSize;
      photo.x = 12;
      photo.y = wrapper.height - photoSize - 12;
      wrapper.addChild(photo);

      name.x = photo.x + photo.width + 12;
      name.y = 6;
      wrapper.addChild(name);

      messageBox.style = getMessageStyle(wrapper.width - photoSize - 36);
      messageBox.x = photo.x + photo.width + 12;
      messageBox.y = name.y + name.height + 6;
      wrapper.addChild(messageBox);
    } else {
      name.x = 12;
      name.y = 6;
      wrapper.addChild(name);

      messageBox.style = getMessageStyle(wrapper.width - 36);
      messageBox.x = 12;
      messageBox.y = name.y + name.height + 6;
      wrapper.addChild(messageBox);
    }

    const messageIdxLimit = message.length;
    let messageStartIdx = 0;
    let messageEndIdx = 0;
    let isMessageOverflowed = false;

    const heightThreshold = wrapper.height;
    const showPartedMessage = () => {
      while (messageEndIdx <= messageIdxLimit && !isMessageOverflowed) {
        messageEndIdx += 1;
        messageBox.text = message.substring(messageStartIdx, messageEndIdx);
        if (wrapper.height > heightThreshold) {
          isMessageOverflowed = true;
          messageEndIdx -= 1;
        }
      }
      isMessageOverflowed = false;
      messageStartIdx = messageEndIdx;
    };

    application.stage.addChild(wrapper);

    showPartedMessage();

    return new Promise((resolve) => {
      wrapper.eventMode = 'static';
      wrapper.addEventListener('touchstart', (evt) => {
        evt.stopPropagation();
        if (messageEndIdx > messageIdxLimit) {
          application.stage.removeChild(wrapper);
          resolve(undefined);
        } else {
          showPartedMessage();
        }
      });
    });
  },
};

export { imessenger };
