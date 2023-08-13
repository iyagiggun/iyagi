import { Application, Graphics, Sprite } from 'pixi.js';
import { CharacterType } from '../../object/character';

export type MessageProps = {
    application: Application;
    speaker: CharacterType;
    message: string;
    width?: number;
    height?: number;
}

export function show_message({ application, speaker, message, width: _width, height: _height}: MessageProps) {

  const width = _width || application.view.width;
  const height = _height || application.view.height / 2 - 48;

  const wrapper = new Graphics();
  wrapper.beginFill(0x000000, 0.7);
  wrapper.drawRect(0, 0, width, height);
  wrapper.endFill();
  wrapper.x = 0;
  wrapper.y = height - wrapper.height;

  const photo_width = Math.min(144, height / 2);
  const photo_height = Math.min(144, height / 2);
  const photo = new Sprite(speaker.get_photo_texture());
  photo.width = photo_width;
  photo.height = photo_height;
  photo.x = 12;
  photo.y = wrapper.height - photo_height - 12;
  wrapper.addChild(photo);

  application.stage.addChild(wrapper);
  return null;
}

