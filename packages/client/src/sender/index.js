/** @type { WebSocket | null } */
let websocket = null;

const get = () => {
  if (!websocket) {
    throw new Error('sender is not initialized');
  }
  return websocket;
};

const sender = {
  /**
   * @param {WebSocket} ws
   */
  init: (ws) => {
    websocket = ws;
  },
  /**
   * @param {*} data // TODO
   */
  send: (data) => {
    const ws = get();
    ws.send(JSON.stringify(data));
  },
};

export default sender;
