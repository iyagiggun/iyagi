import { getOverlapRatio } from '@iyagi/commons/coords';
import { Subject } from 'rxjs';

/**
 * @typedef {{
 *  target: import('../object/index.js').ServerObjectType;
 *  ratio: number;
 * }} InPayload
 */

/**
 * @typedef {{
 *  target: import('../object/index.js').ServerObjectType;
 * }} OutPayload
 */

export class Field {
  /** @type {import("@iyagi/commons/coords").Area} */
  #area;

  /**
   * @type {Subject<InPayload>}
   */
  #in$ = new Subject();
  in$ = this.#in$.asObservable();

  /**
   * @type {Subject<OutPayload>}
   **/
  #out$ = new Subject();
  out$ = this.#out$.asObservable();

  /**
   * @type {Set<import("../object/index.js").ServerObjectType>}
   */
  #incomming = new Set();

  /**
   * @param {import("@iyagi/commons/coords").Area} area
   */
  constructor(area) {
    this.#area = area;
  }

  /**
   * @readonly
   */
  get area() {
    return this.#area;
  }

  /**
   * @param {import("../object/index.js").ServerObjectType} object
   */
  checkIn(object) {
    if (this.#incomming.has(object)) return;

    const ratio = getOverlapRatio(object.area, this.#area);
    if (ratio > 0) {
      this.#incomming.add(object);
      this.#in$.next({
        target: object,
        ratio,
      });
    }
  }

  /**
   * @param {import("../object/index.js").ServerObjectType} object
   */
  checkOut(object) {
    if (!this.#incomming.has(object)) return;

    const ratio = getOverlapRatio(object.area, this.#area);
    if (ratio === 0) {
      this.#incomming.delete(object);
      this.#out$.next({ target: object });
    }
  }

  destroy() {
    this.#in$.complete();
    this.#out$.complete();
    this.#incomming.clear();
  }
}

/**
 * @typedef {Field} FieldType
 */
