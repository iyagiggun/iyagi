import { Subject } from 'rxjs';
import { ServerCommand } from './command/index.js';

export class Shard {
  #key;

  /**
   * @param {Object} p
   * @param {string} p.key
   * @param {import('../object/index.js').ServerObject[]} p.objects
   */
  constructor({
    key,
    objects,
  }) {
    this.#key = key;
    this.objects = objects;

    /**
     * @type {Subject<import('../const/index.js').ServerPayload>}
     */
    this.load$ = new Subject();
    /**
     * @type {Subject<import('../const/index.js').ServerPayload>}
     */
    this.loaded$ = new Subject();

    /**
     * @type {Subject<import('../const/index.js').ServerPayload>}
     * @description Operates based on delta values
     */
    this.move$ = new Subject();

    /**
     * @type {Subject<import('../const/index.js').ServerPayload>}
     */
    this.interact$ = new Subject();

    this.load$.subscribe(({ shard, reply }) => {
      reply([{
        type: 'shard.load',
        data: {
          shard: {
            objects: shard.objects.map((o) => o.toLoadData()),
          },
        },
      }]);
    });
  }

  command() {
    return new ServerCommand();
  }

  get key() {
    return this.#key;
  }

  get id() {
    return 'SHARD';
  }
}
