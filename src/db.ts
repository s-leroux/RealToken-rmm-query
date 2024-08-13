import Database from 'better-sqlite3';

export class Db {
  readonly sqlite3;

  constructor(sqlite3) {
    this.sqlite3 = sqlite3;
  }

  static fromPath(path: string) {
    const sqlite3 = new Database(path);
    sqlite3.pragma('journal_mode = WAL');

    return new Db(new Database(path));
  }
}
