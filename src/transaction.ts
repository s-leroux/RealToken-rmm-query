import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'node:url';
import { GnosisScan } from './service/gnosisscan';

const GNOSIS_NATIVE_COIN_DECIMALS=18

import { Decimal, toInteger } from "./decimal";
import { Swarm } from "./swarm";

export class Transaction {
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
        .div(Decimal.E18);
    }
    this.feesAsString = this.fees.toString();
  }


}
