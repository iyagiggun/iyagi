import { Subject } from 'rxjs';

export class Shard {
  #key;
  /** @type {NodeJS.Timeout | null} */
  #tick_interval = null;
  /** @type {Set<import('../user/index.js').UserType>} */
  users = new Set();

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
     * @type {Subject<import('../user/index.js').UserType>}
     */
    this.loaded$ = new Subject();

    /**
     * tick 마다 network 가 발생하게 구현하면 안됨. tick 과 클라이언트로 전송하는 snapshot 의 별도 분리가 필요
     * @type {Subject<import('../user/index.js').UserType>}
     */
    this.tick$ = new Subject();

    /**
     * @type {Subject<import('../user/index.js').UserType>}
     */
    this.leave$ = new Subject();

    this.loaded$.subscribe((user) => {
      this.users.add(user);
      if (this.#tick_interval === null) {
        this.#tick_interval = setInterval(() => {
          this.objects.forEach((object)=> object.impulse$.next(this));
          if (this.users.size === 0 && this.#tick_interval !== null) {
            clearInterval(this.#tick_interval);
            this.#tick_interval = null;
          }
        }, 50);
      }
    });

    this.leave$.subscribe((user) => {
      this.users.delete(user);
    });
  }

  get key() {
    return this.#key;
  }

  get id() {
    return 'SHARD';
  }
}

/**
 * @typedef {Shard} ShardType
 */
