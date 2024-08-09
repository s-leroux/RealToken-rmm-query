import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'node:url';
import { GnosisScan } from './service/gnosisscan';

const GNOSIS_NATIVE_COIN_DECIMALS=18


class Transfer {
  /*
   * Abstract representation of a transfer.
   */
  readonly data: object;
  readonly blockNumber: number;
  readonly timeStamp: number;
  readonly from;
  readonly to;
  readonly contractAddress;
  readonly amount;
  readonly amountAsString;
  readonly unit: string|null;
  readonly symbol: string|null;
  readonly fees;
  readonly feesAsString;

  constructor(swarm: Swarm, data) {
    this.data = data;
    this.blockNumber = toInteger(data.blockNumber);
    this.timeStamp = toInteger(data.timeStamp);

    this.from = swarm.item(data.from);
    this.to = swarm.item(data.to);
    this.contractAddress = swarm.item(data.contractAddress);

    const value = data.value;
    if (value === undefined) {
      this.amount = Decimal.ZERO;
    }
    else {
      const decimal = data.tokenDecimal ?? GNOSIS_NATIVE_COIN_DECIMALS;

      this.amount = Decimal.fromDigits(value, decimal);
      this.amountAsString = this.amount.toString(); // Mostly for testing purposes
    }

    this.unit = data.tokenName ?? null;
    this.symbol = data.tokenSymbol ?? null;

    const gasPrice = data.gasPrice;
    if (gasPrice === undefined) {
      this.fees = Decimal.ZERO;
    }
    else {
      this.fees = Decimal.fromInteger(gasPrice)
        .mul(data.gasUsed)
        .div(E18);
    }
    this.feesAsString = this.fees.toString();
  }


}

import { Swarm } from "./swarm";
import { Decimal, toInteger } from "./decimal";

const E18=Decimal.fromInteger(1e18);

class Account {
  readonly scanner: GnosisScan;
  readonly swarm: Swarm;
  readonly address;

  constructor(scanner: GnosisScan, swarm: Swarm, address: string) {
    this.scanner = scanner
    this.swarm = swarm
    this.address = address

    // populate with well-known addresses
    this.swarm.item("0x0000000000000000000000000000000000000000", { name: "Null" });
  }

  async normalTransactions() {
    const res = await this.scanner.accountNormalTransactions(this.address);
    return res.result
      .filter(tr => tr.isError === "0")
      .map((t) => new Transfer(this.swarm, t));
  }

  async internalTransactions() {
    const res = await this.scanner.accountInternalTransactions(this.address);
    return res.result
      .filter(tr => tr.isError === "0")
      .map((t) => new Transfer(this.swarm, t));
  }

  async tokenTransfers() {
    const res = await this.scanner.accountTokenTransfers(this.address);
    return res.result
      .map((t) => new Transfer(this.swarm, t));
  }

  async allTransfers() {
    /*
     * Merge {normal, internal, token} transfers in one single list ordered by timestamp.
     */

    // naive implementation
    const result = await this.normalTransactions();
    for (const item of await this.internalTransactions())
      result.push(item);
    for (const item of await this.tokenTransfers())
      result.push(item);

    return result.sort((a, b) => a.blockNumber - b.blockNumber);
  }
}

export class Graph {
  readonly scanner: GnosisScan;
  readonly swarm: Swarm;

  constructor(scanner: GnosisScan) {
    this.scanner = scanner;
    this.swarm = new Swarm();
  }

  account(address: string) {
    return new Account(this.scanner, this.swarm, address);
  }
}
