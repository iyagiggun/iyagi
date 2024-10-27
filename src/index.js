/**
 * @typedef {Object} Server
 * @property {(type: string, handler: () => void) => void} on
 */


/**
 * @param {*} msg
 */
const onMessage = (msg) => {
  console.error(msg);
};

const reciever = {
  onMessage,
};

export default reciever;
