/**
 * @type {import("pixi.js").Application<import("pixi.js").ICanvas> | undefined}
 */
let app;

const IApplication = {
  get: () => {
    if (!app) {
      throw new Error('There is no iyagi.');
    }
    return app;
  },
  /**
   * @param {import("pixi.js").Application<import("pixi.js").ICanvas>} _app
   */
  set: (_app) => {
    app = _app;
  },
};

export default IApplication;
