import { Transaction } from "./transaction"

type Sortable = { key };
export function sort<T extends Sortable>(arr: Array<T>) {
  /**
   * Sort an array by its item's key.
   * Do *not* remove duplicate values.
   */
  arr = arr.slice(); // clone the array
  arr.sort((a,b) =>
    (a.key > b.key) ? 1 :
    (a.key < b.key) ? -1 :
    0
  );

  return arr;
}

export function join<T extends Sortable>(a: Array<T>, b: Array<T>) {
  /**
   * Join two ledgers and remove duplicates based on their key.
   * Do *not* remove duplicate values.
   */
  const dst: Array<T> = [];
  const la = a.length;
  let ia = 0;
  const lb = b.length;
  let ib = 0

  let ka, kb;

  while ((ia < la) && (ib < lb)) {
    ka = a[ia].key
    kb = b[ib].key

    while (ka <= kb) {
      dst.push(a[ia++]);
      if (ia === la)
        break

      ka = a[ia].key
    }
    while (kb <= ka) {
      dst.push(b[ib++]);
      if (ib === lb)
        break

      kb = b[ib].key
    }
  }

  while (ia < la) {
    dst.push(a[ia++]);
  }

  while (ib < lb) {
      dst.push(b[ib++]);
  }

  return dst;
}

export class Ledger implements Iterable<Transaction> {
  /**
   * A Ledger is a list of transactions.
   */
   list: Array<Transaction>;

  constructor(list: Array<Transaction>) {
    this.list = list
  }

  static create(list?: Ledger|Array<Transaction>) {
    if (list instanceof Ledger)
      return list;

    if (list === undefined)
      return new Ledger([]); // Should be a constant?

    // otherwise
    return new Ledger(list)
  }

  union(other: Ledger|Array<Transaction>) {
    /**
     *`Add, sort, and deduplicate transaction in this ledger.
     */
    const a = this.list;
    let b: Array<Transaction>;

    if (other instanceof Ledger) {
      b = other.list;
    }
    else {
      // Assume an _unsorted_ array of transactions.
      b = sort(<Array<Transaction>>other);
    }

    return new Ledger(join(a, b));
  }

  reduce(fn, acc) {
    let idx = 0;

    for (const tr of this.list) {
      acc = fn(acc, tr, idx++, this);
    }

    return acc;
  }

  *[Symbol.iterator](): IterableIterator<Transaction> {
    for(const tr of this.list)
      yield tr;
  }
};
