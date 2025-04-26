import { IMT } from '../const/message.js';

/**
 * @typedef {{
 *  type: string,
 *  data?: any,
 * }} Message
 */

/**
 * @typedef {{
 *  user: import('../user/index.js').User;
 *  shard: import('../shard/index.js').Shard;
 *  message: Message;
 *  reply: (message: Message) => void;
 * }} SubjectData
 */

/**
 * @typedef {(data: SubjectData) => import('rxjs').Observable<Message>} Process
 */


/**
 * @typedef {{
 *  tell: (message: Message) => void,
 * }} TellerParams
 */

export class Teller {
  /**
   * @param {SubjectData} data
   */
  ask(data) {
    switch(data.message.type) {
      case IMT.START:
      case IMT.SHARD_LOAD:
        data.shard.load$.next(data);
        return;
      case IMT.SHARD_LOADED:
        data.shard.loaded$.next(data);
        return;
      case IMT.OBJECT_MOVE:
        data.shard.move$.next(data);
        return;
      case IMT.OBJECT_INTERACT:
        data.shard.interact$.next(data);
        return;
      default:
        console.error('server recieve unknown message', data.message);

    }
  }
}
