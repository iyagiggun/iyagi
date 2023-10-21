/**
 * @param {number} seconds
 * @returns
 */
// eslint-disable-next-line max-len
export const wait = (seconds) => new Promise((resolve) => { window.setTimeout(() => resolve(undefined), seconds * 1000); });
