let debug = false;

const DevTools = {
  enableDebug() {
    debug = true;
  },
  isDebugMode() {
    return debug;
  }
};

const wait = (seconds: number) => {
  return new Promise<void>((resolve) => { window.setTimeout(() => resolve(), seconds * 1000); });
};

export { DevTools, wait };