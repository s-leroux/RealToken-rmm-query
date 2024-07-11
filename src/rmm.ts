import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'node:url';

const GNOSISSCAN_BASE_ADDRESS='https://api.gnosisscan.io/api'
const GNOSIS_NATIVE_COIN_DECIMALS=18

export class Scanner {
  readonly origin;
  readonly api_key;

  constructor(api_key: string, origin: string = GNOSISSCAN_BASE_ADDRESS) {
    this.origin = origin;
    this.api_key = api_key;
  }

  buildUrl(params): URL {
    const url = new URL(this.origin);
    const search_params = new URLSearchParams(params);
    search_params.set('apiKey', this.api_key);
    url.search = search_params.toString()

    return url;
  }

  async fetch(params) {
    const url = this.buildUrl(params);
    const res = await fetch(url);

    return await res.json();
  }

  async accountNormalTransactions(address: string) {
    const params = {
      module: 'account',
      action: 'txlist',
      startBlock: 0,
      endBlock: 99999999,
      sort: 'asc',
      address: address,
    }
    return await this.fetch(params)
  }

  async accountInternalTransactions(address: string) {
    const params = {
      module: 'account',
      action: 'txlistinternal',
      startBlock: 0,
      endBlock: 99999999,
      sort: 'asc',
      address: address,
    }
    return await this.fetch(params)
  }

  async accountTokenTransfers(address: string) {
    const params = {
      module: 'account',
      action: 'tokentx',
      startBlock: 0,
      endBlock: 99999999,
      sort: 'asc',
      address: address,
    }
    return await this.fetch(params)
  }
}

class Transfer {
  /*
   * Abstract representation of a transfer.
   */
  readonly data: object;
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

    this.from = swarm.item(data.from);
    this.to = swarm.item(data.to);
    this.contractAddress = swarm.item(data.contractAddress);

    const value = data.value;
    if (value === undefined) {
      this.amount = Decimal.fromInteger(0);
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
      this.fees = Decimal.fromInteger(0);
    }
    else {
      this.fees = Decimal.fromInteger(gasPrice)
        .mul(data.gasUsed)
        .div(E18);
      this.feesAsString = this.fees.toString();
    }
  }


}

import { Swarm } from "./swarm";
import { Decimal } from "./decimal";

const E18=Decimal.fromInteger(1e18);

class Account {
  readonly scanner: Scanner;
  readonly swarm: Swarm;
  readonly address;

  constructor(scanner: Scanner, swarm: Swarm, address: string) {
    this.scanner = scanner
    this.swarm = swarm
    this.address = address

    // populate with well-known addresses
    this.swarm.item("0x0000000000000000000000000000000000000000", { name: "Null" });
  }

  async normalTransactions() {
    const res = await this.scanner.accountNormalTransactions(this.address);
    return res.result.map((t) => new Transfer(this.swarm, t));
  }

  async internalTransactions() {
    const res = await this.scanner.accountInternalTransactions(this.address);
    return res.result.map((t) => new Transfer(this.swarm, t));
  }

  async tokenTransfers() {
    const res = await this.scanner.accountTokenTransfers(this.address);
    return res.result.map((t) => new Transfer(this.swarm, t));
  }
}

export class Graph {
  readonly scanner: Scanner;
  readonly swarm: Swarm;

  constructor(scanner: Scanner) {
    this.scanner = scanner;
    this.swarm = new Swarm();
  }

  account(address: string) {
    return new Account(this.scanner, this.swarm, address);
  }
}
