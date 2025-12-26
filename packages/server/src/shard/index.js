import { Subject } from 'rxjs';
import { StageDirector } from '../director/stage.js';
import { Impulser } from './impulser.js';

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
    this.impulser = new Impulser();

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

    this.load$.subscribe(({ user, reply }) => {
      reply([
        StageDirector.enter({
          user,
          shard: this.#key,
        }),
      ]);
    });
  }

  get key() {
    return this.#key;
  }

  get id() {
    return 'SHARD';
  }
}
