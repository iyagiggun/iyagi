import { Application, Container } from 'pixi.js';

export const create_camera = (app: Application, container: Container) => {

  const move_to = (x: number, y: number, _speed: number) => new Promise<void>((resolve) => {
    console.debug('target', x, y );
    const { width: app_width, height: app_height } = app.view;
    const dest_x = Math.round((app_width / 2) - x);
    const dest_y = Math.round((app_height / 2) - y);
    const speed = _speed * 2;
    const { ticker } = app;
    const tick = () => {
      const cur_x = container.x;
      const cur_y = container.y;
      const diff_x = dest_x - cur_x;
      const diff_y = dest_y - cur_y;
      const distance = Math.sqrt(diff_x ** 2 + diff_y ** 2);
      const arrived = distance < speed;
      if (arrived) {
        container.x = dest_x;
        container.y = dest_y;
        ticker.remove(tick);
        resolve();
      } else {
        const delta_x = speed * (diff_x / distance);
        const delta_y = speed * (diff_y / distance);
        container.x += Math.round(delta_x);
        container.y += Math.round(delta_y);
      }
    };
    ticker.add(tick);
  });

  return Object.freeze({
    move_to
  });
};