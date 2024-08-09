import { Decimal, BigNumber } from "./decimal";

export class Snapshot {
  readonly timestamp: number;
  readonly portfolio: Map<string|null,BigNumber>;

  constructor(timestamp: number, portfolio?) {
    this.timestamp = timestamp;
    this.portfolio = portfolio ?? new Map();
  }

  deposit(timestamp: number, coin, amount) {
    const portfolio = new Map(this.portfolio);
    const prev_balance = portfolio.get(coin) ?? Decimal.ZERO;
    portfolio.set(coin, prev_balance.add(amount));

    console.log("TX", coin, amount.toString());

    return new Snapshot(timestamp, portfolio);
  }

  withdraw(timestamp: number, coin, amount) {
    return this.deposit(timestamp, coin, amount.neg());
  }
}
