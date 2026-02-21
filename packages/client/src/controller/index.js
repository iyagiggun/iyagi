import { joystick } from './joystick.js';
import { pad } from './pad.js';

export const icontroller = {
  init() {
    joystick.init();
    pad.init();
  },
  joystick: joystick.export,
  pad: pad.export,
};
