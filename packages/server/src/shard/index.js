import { Subject } from 'rxjs';
import { StageDirector } from '../director/stage.js';

export class Shard {
  #key;
  /** @type {number | null} */
  #tick_interval = null;

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
     */
    this.tick$ = new Subject();

    /**
     * @type {Subject<import('../const/index.js').ServerPayload>}
     */
    this.leave$ = new Subject();

    this.load$.subscribe(({ user, reply, shard }) => {
      reply([
        StageDirector.enter({
          user,
          shard: this.#key,
        }),
      ]);
      this.#tick_interval = setInterval(() => {
        this.tick$.next({ user, shard, reply });
      }, 50);
    });

    this.leave$.subscribe(() => {
      if (this.#tick_interval !== null) {
        clearInterval(this.#tick_interval);
        this.#tick_interval = null;
      }
    });
  }

  get key() {
    return this.#key;
  }

  get id() {
    return 'SHARD';
  }
}
