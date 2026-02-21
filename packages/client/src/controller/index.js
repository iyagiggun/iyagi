import { joystick } from './joystick.js';
import { pad } from './pad.js';

export const icontroller = {
  init() {
    joystick.init();
    pad.init();
  },
  joystick: {
    tap$: joystick.tap$,
    move$: joystick.move$,
  },
  pad: {
    tap$: pad.tap$,
    gesture$: pad.gesture$,
  },
};
