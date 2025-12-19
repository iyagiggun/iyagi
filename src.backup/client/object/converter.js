import ClientObject from './index.js';

/**
 * @param {import("./index.js").ClientObjectParams} params
 */
const DEFAULT_CONVERTER = (params) => new ClientObject(params);

let converter = DEFAULT_CONVERTER;

/**
 * @typedef {(input: import('./index.js').ClientObjectParams) => ClientObject} ObjectConverterType
 */

export const ObjectConverter = {
  get convert() {
    return converter;
  },
  /**
   * @param {ObjectConverterType} next
   */
  set: (next) => {
    converter = next;
  },
};

