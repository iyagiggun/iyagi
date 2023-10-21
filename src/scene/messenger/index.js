const {
  Graphics, Sprite, TextStyle, Text,
} = require('pixi.js');
const { default: IApplication } = require('../../application');

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

const IMessenger = {
  create: () => {
    /**
     *
     * @param {Object} p
     * @param {import('../../object/character/type').ICharacterCreated} p.speaker
     * @param {string} p.message
     * @param {number} [p.width]
     * @param {number} [p.height]
     * @returns
     */
    const showMessage = ({
      speaker,
      message,
      width,
      height,
    }) => {
      const app = IApplication.get();

      const applicationWidth = app.view.width;
      const applicationHeight = app.view.height;

      const wrapperWidth = width || applicationWidth;
      const wrapperHeight = height || applicationHeight / 2 - 48;

      const wrapper = new Graphics();
      wrapper.beginFill(0x000000, 0.7);
      wrapper.drawRect(0, 0, wrapperWidth, wrapperHeight);
      wrapper.endFill();
      wrapper.x = 0;
      wrapper.y = applicationHeight - wrapperHeight;

      const photoSize = Math.min(144, Math.min(applicationWidth, applicationHeight) / 2);
      const photo = new Sprite(speaker.getPhotoTexture());
      photo.width = photoSize;
      photo.height = photoSize;
      photo.x = 12;
      photo.y = wrapper.height - photoSize - 12;
      wrapper.addChild(photo);

      const name = new Text(speaker.name, NAME_STYLE);
      name.x = photo.x + photo.width + 12;
      name.y = 6;
      wrapper.addChild(name);

      const messageBoxWidth = wrapper.width - photoSize - 36;
      const messageBox = new Text('', getMessageStyle(messageBoxWidth));
      messageBox.x = photo.x + photo.width + 12;
      messageBox.y = name.y + name.height + 6;
      wrapper.addChild(messageBox);

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

      app.stage.addChild(wrapper);

      showPartedMessage();

      return new Promise((resolve) => {
        wrapper.eventMode = 'static';
        wrapper.addEventListener('touchstart', (evt) => {
          evt.stopPropagation();
          if (messageEndIdx > messageIdxLimit) {
            app.stage.removeChild(wrapper);
            resolve(undefined);
          } else {
            showPartedMessage();
          }
        });
      });
    };
    return {
      showMessage,
    };
  },
};

export default IMessenger;
