import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'node:url';
import { GnosisScan } from './service/gnosisscan';

const GNOSIS_NATIVE_COIN_DECIMALS=18

import { Decimal, toInteger } from "./decimal";
import { Swarm } from "./swarm";

type TransactionType =
  "NORMAL"        // a normal transaction
  | "INTERNAL"    // an internal transaction
  | "ERC20"       // an ERC-20 token transfer
;

export class Transaction {
  /*
   * Abstract representation of a transfer.
   */
  readonly type: TransactionType;
  readonly key: string;
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
  readonly data: object;

  constructor(swarm: Swarm, type: TransactionType, data) {
    this.type = type
    this.key =
      data.timeStamp.padStart(12)
      + data.blockNumber.padStart(12)
      + (data.nonce ?? "0").padStart(10);
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
};

export class NormalTransaction extends Transaction {
  /**
   * A normal transaction is a a transaction where an Externally Owned Address (EOA) sends
   * ETH directly to another EOA.
   */
  constructor(swarm: Swarm, data) {
    super(swarm, "NORMAL", data);
  }

};

export class InternalTransaction extends Transaction {
  /**
   * Internal transactions are not initiated by a user. Instead, theyare initiated by smart
   * contract code when certain conditions within the contract are met.
   *
   * For internal transactions the Gas is paid for by the original normal transaction that
   * triggered the smart contract.
   */
  constructor(swarm: Swarm, data) {
    super(swarm, "INTERNAL", data);
  }

};

export class ERC20TokenTransfer extends Transaction {
  /**
   * An ERC-20 token transfer;
   */
  constructor(swarm: Swarm, data) {
    super(swarm, "ERC20", data);
  }

};
