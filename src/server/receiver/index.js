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
 * }} ClientPayload
 */

/**
 * @typedef {(data: ClientPayload) => import('rxjs').Observable<Message>} Process
 */


/**
 * @typedef {{
 *  tell: (message: Message) => void,
 * }} TellerParams
 */

export class ServerReceiver {
  /**
   * @param {ClientPayload} payload
   */
  receive(payload) {
    switch(payload.message.type) {
      case 'shard.load':
        payload.user.shard.load$.next(payload);
        return;
      case 'shard.loaded':
        payload.user.shard.loaded$.next(payload);
        return;
      case 'object.move':
        payload.user.shard.move$.next(payload);
        return;
      case 'object.interact':
        payload.user.shard.interact$.next(payload);
        return;
      default:
        console.error('server recieve unknown message', payload.message);
    }
  }
}
