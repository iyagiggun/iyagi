let debug = false;

const DevTools = {
  enableDebug() {
    debug = true;
  },
  isDebugMode() {
    return debug;
  }
};

export { DevTools };