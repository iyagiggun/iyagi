/**
 * @typedef {{
 *  type: string,
 *  data?: any,
 * }} Message
 */

/**
 * @typedef {{
 *  user: import('../user/index.js').User;
 *  message: import('../../client/const/index.js').ClientMessage;
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
      case 'shard.load':
        data.user.shard.load$.next(data);
        return;
      case 'shard.loaded':
        data.user.shard.loaded$.next(data);
        return;
      case 'object.move':
        data.user.shard.move$.next(data);
        return;
      case 'object.interact':
        data.user.shard.interact$.next(data);
        return;
      default:
        console.error('server recieve unknown message', data.message);

    }
  }
}
