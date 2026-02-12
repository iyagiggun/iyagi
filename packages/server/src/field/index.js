import { getOverlapRatio } from '@iyagi/commons/coords';
import { Subject } from 'rxjs';

export class Field {
  /** @type {import("@iyagi/commons/coords").Area} */
  #area;

  /**
   * @type {import("rxjs").Subject<import("../object/index.js").ServerObjectType>}
   */
  #in$ = new Subject();

  /**
   * @type {import("rxjs").Subject<import("../object/index.js").ServerObjectType>}
   **/
  #out$ = new Subject();

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
   * @readonly
   */
  get in$() {
    return this.#in$.asObservable();
  }

  /**
   * @readonly
   */
  get out$() {
    return this.#out$.asObservable();
  }

  /**
   * @param {import("../object/index.js").ServerObjectType} object
   */
  checkIn(object) {
    if (this.#incomming.has(object)) return;

    const ratio = getOverlapRatio(object.area, this.#area);
    if (ratio > 0) {
      this.#incomming.add(object);
      this.#in$.next(object);
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
      this.#out$.next(object);
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
