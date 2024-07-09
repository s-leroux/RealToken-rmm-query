export class Swarm {
  /*
   *  A collection of objects.
   */
  readonly map: Map<string, object>;

  constructor() {
    this.map = new Map();
  }

  item(key: string, data = {}) {
    let obj = this.map.get(key);
    if (obj === undefined) {
      obj = { __id: key };
      this.map.set(key, obj);
    }

    Object.assign(obj, data);

    return obj;
  }
}
