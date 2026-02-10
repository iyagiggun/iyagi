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
     * @type {Subject<import('../user/index.js').UserType>}
     */
    this.leave$ = new Subject();

    this.loaded$.subscribe((user) => {
      this.users.add(user);
      if (this.#tick_interval === null) {
        this.#tick_interval = setInterval(() => {
          this.objects.forEach((object) => object.impulse$.next(this));
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

  /**
   * @param {import('../const/index.js').ServerMessage[]} messages
   */
  sync(messages) {
    if (messages.length > 0 === false) {
      return;
    }
    this.users.forEach((user) => {
      user.send(messages);
    });
  }
}

/**
 * @typedef {Shard} ShardType
 */
