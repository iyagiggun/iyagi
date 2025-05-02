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
      case IMT.SHARD_LOAD:
        data.user.shard.load$.next(data);
        return;
      case IMT.SHARD_LOADED:
        data.user.shard.loaded$.next(data);
        return;
      case IMT.OBJECT_MOVE:
        data.user.shard.move$.next(data);
        return;
      case IMT.OBJECT_INTERACT:
        data.user.shard.interact$.next(data);
        return;
      default:
        console.error('server recieve unknown message', data.message);

    }
  }
}
