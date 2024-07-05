const DEFEAULT_DELAY = 250;

/**
 * @typedef Options
 * @property {number} [delay]
 */

const listenerMap = new WeakMap();

class ICSWebsocket {

  #e = new EventTarget();

  #interval = Number.NaN;

  /**
   * @param {Options} options 
   * @returns 
   */
  constructor(options = {}) {
    window.setTimeout(() => {
      this.#e.dispatchEvent(new CustomEvent('open', { detail: new MessageEvent('open') }));

      this.#interval = window.setInterval(() => {
        const message = new MessageEvent('message', { data: 'data' });
        this.#e.dispatchEvent(new CustomEvent('message', { detail: { message } }));
      }, options.delay ?? DEFEAULT_DELAY);
    }, 50);
  }

  /**
   * @param {string} type 
   * @param {(event: MessageEvent) => void} listener 
   */
  addEventListener(type, listener) {
    listenerMap.set(listener, 
      /**
       * @param {CustomEvent<MessageEvent>} evt 
       */
      (evt) => listener(evt.detail)
    );
    this.#e.addEventListener(type, listenerMap.get(listener));
  }

  /**
   * @param {string} type 
   * @param {(event: MessageEvent) => void} listener 
   */
  removeEventListener(type, listener) {
    this.#e.removeEventListener(type, listenerMap.get(listener));
  }

  /**
   * @param {string} message 
   */
  send(message) {
    console.error('sended', message);
  }

  close() {
    window.clearInterval(this.#interval);
    this.#e.dispatchEvent(new CustomEvent('close', { detail: new MessageEvent('close') }));
  }
}

export default ICSWebsocket;
