import IMonoObject from '../mono';
import ITileEvents from './events';

class ITile extends IMonoObject {
  events = new ITileEvents(this.container);

  /**
   * @param {import('./mono').IMonoObjectParameter} p
   */
  constructor(p) {
    super({
      ...p,
      z: 0,
    });
  }
}

export default ITile;
