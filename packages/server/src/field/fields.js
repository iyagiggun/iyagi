export class Fields {
  /** @type {Set<import("./index.js").FieldType>} */
  #fields = new Set();

  #objects;

  /**
   * @param {import("../object/index.js").ServerObjectType[]} objects
   */
  constructor(objects) {
    this.#objects = objects;
  }

  /**
   * @param {import("./index.js").FieldType} field
   */
  add(field) {
    this.#objects.forEach((object) => field.checkIn(object));
    this.#fields.add(field);
  }

  /**
   * @param {import("./index.js").FieldType} field
   */
  remove(field) {
    field.destroy();
    this.#fields.delete(field);
  }

  /**
   * @param {import("../object/index.js").ServerObjectType} object
   */
  check(object) {
    this.#fields.forEach((field) => {
      field.checkIn(object);
      field.checkOut(object);
    });
  }
}
