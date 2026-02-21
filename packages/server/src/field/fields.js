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
   * @param {import("./index.js").FieldType | import("./index.js").FieldType[]} field
   */
  add(field) {
    if (Array.isArray(field)) {
      field.forEach((f) => this.add(f));
      return;
    }
    this.#objects.forEach((object) => field.checkIn(object));
    this.#fields.add(field);
  }

  /**
   * @param {import("./index.js").FieldType | import("./index.js").FieldType[]} field
   */
  delete(field) {
    if (Array.isArray(field)) {
      field.forEach((f) => this.delete(f));
      return;
    }
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
