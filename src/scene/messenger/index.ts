import { Application, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { CharacterType } from '../../object/character';

const NAME_STYLE = new TextStyle({
  fontSize: 24,
  fontStyle: 'italic',
  fontWeight: 'bold',
  fill: 0xffffff,
});

const getMessageStyle = (width: number) => new TextStyle({
  fontFamily: 'Arial',
  fontSize: 24,
  // fontSize: 18,
  wordWrap: true,
  wordWrapWidth: width,
  fill: [0xffffff, 0xaaaaaa],
});

export type MessageProps = {
    application: Application;
    speaker: CharacterType;
    message: string;
    width?: number;
    height?: number;
}

export function show_message({ application, speaker, message, width, height}: MessageProps) {

  const application_width = application.view.width;
  const application_height = application.view.height;

  const wrapper_width = width || application_width;
  const wrapper_height = height || application_height / 2 - 48;

  const wrapper = new Graphics();
  wrapper.beginFill(0x000000, 0.7);
  wrapper.drawRect(0, 0, wrapper_width, wrapper_height);
  wrapper.endFill();
  wrapper.x = 0;
  wrapper.y = application_height - wrapper_height;

  const photo_size = Math.min(144, Math.min(application_width, application_height) / 2 );
  const photo = new Sprite(speaker.get_photo_texture());
  photo.width = photo_size;
  photo.height = photo_size;
  photo.x = 12;
  photo.y = wrapper.height - photo_size - 12;
  wrapper.addChild(photo);

  const name = new Text(speaker.name, NAME_STYLE);
  name.x = photo.x + photo.width + 12;
  name.y = 6;
  wrapper.addChild(name);

  const message_box_width = wrapper.width - photo_size - 36;
  const message_box = new Text('', getMessageStyle(message_box_width));
  message_box.x = photo.x + photo.width + 12;
  message_box.y = name.y + name.height + 6;
  wrapper.addChild(message_box);

  const message_idx_limit = message.length;
  let message_start_idx = 0;
  let message_end_idx = 0;
  let is_message_overflowed = false;

  const height_threshold = wrapper.height;
  // const is_message_overflowed = () => wrapper.height > height_threshold;
  const show_parted_message = () => {
    while(message_end_idx <= message_idx_limit && !is_message_overflowed) {
      message_end_idx += 1;
      message_box.text = message.substring(message_start_idx, message_end_idx);
      if (wrapper.height > height_threshold) {
        is_message_overflowed = true;
        message_end_idx -= 1;
      }
    }
    is_message_overflowed = false;
    message_start_idx = message_end_idx;
  };

  application.stage.addChild(wrapper);

  show_parted_message();

  return new Promise<void>((resolve) => {
    wrapper.interactive = true;
    wrapper.addEventListener('touchstart', (evt) => {
      evt.stopPropagation();
      if (message_end_idx > message_idx_limit) {
        application.stage.removeChild(wrapper);
        resolve();
      } else {
        show_parted_message();
      }
    });
  });
}

