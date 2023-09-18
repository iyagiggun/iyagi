let debug = false;

const DevTools = {
  enableDebug() {
    debug = true;
  },
  isDebugMode() {
    return debug;
  },
};

// eslint-disable-next-line max-len
const wait = (seconds: number) => new Promise<void>((resolve) => { window.setTimeout(() => resolve(), seconds * 1000); });

export const TRANSPARENT_1PX_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5QkWDxoxGJD3fwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAALSURBVAjXY2AAAgAABQAB4iYFmwAAAABJRU5ErkJggg==';
export const FRAMES_PER_SECOND = 60;

export { DevTools, wait };
