import { Subject } from 'rxjs';
import { ShardForge } from './forge.js';

export class Shard {
  #key;
  /** @type {number | null} */
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
      if (this.#tick_interval === null) {
        // TODO:: clear 생각할 것
        this.#tick_interval = setInterval(() => {
          this.tick$.next(user);
        }, 50);
      }
      const lastShard = ShardForge.seek(user.shard);
      // TODO:: leave 를 수행 시켜줌 (함수로 하는게 나을 듯 ?)
      lastShard.leave$.next(user);

      this.users.add(user);
    });

    this.leave$.subscribe((user) => {
      if (this.users.size === 0) {
        if (this.#tick_interval === null) {
          console.warn('Invalid case. Shard tick interval is already null.');
        } else {
          clearInterval(this.#tick_interval);
          this.#tick_interval = null;
        }
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
