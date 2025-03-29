import { Subject } from 'rxjs';
import { IMT } from '../const/message.js';
import { ShardMessage } from './message/index.js';

export class Shard {
  /**
   * @param {Object} p
   * @param {import('../object/iobject.js').IObject[]} p.objects
   */
  constructor({
    objects,
  }) {
    this.objects = objects;
    this.message = new ShardMessage(this);
    /**
     * @type {Subject<import('../teller/index.js').SubjectData>}
     */
    this.load$ = new Subject();
    /**
     * @type {Subject<import('../teller/index.js').SubjectData>}
     */
    this.loaded$ = new Subject();

    this.load$.subscribe(({ shard, listen }) => {
      listen({
        type: IMT.SHARD_LOAD,
        data: {
          shard: {
            objects: shard.objects,
          },
        },
      });
    });
  }
}

/**
 * @typedef {Shard} ShardType
 */
