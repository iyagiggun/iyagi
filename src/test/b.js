class BB {
  constructor() {
    console.error('created a');
  }

  /**
   * @param {import('./a').AA} a
   */
  show(a) {
    console.error(this, a);
  }
}

export { BB };
