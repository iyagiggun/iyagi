class AA {
  constructor() {
    console.error('created a');
  }

  /**
   * @param {import('./b').BB} b
   */
  show(b) {
    console.error(this, b);
  }
}

export { AA };
