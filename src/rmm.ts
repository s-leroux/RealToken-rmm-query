import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'node:url'; 

const GNOSISSCAN_BASE_ADDRESS='https://api.gnosisscan.io/api'

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

  async accountTransactions(address: string) {
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

import { Swarm } from "./swarm";
import { Decimal } from "./decimal";

class Account {
  readonly scanner: Scanner;
  readonly swarm: Swarm;

  constructor(scanner: Scanner, swarm: Swarm) {
    this.scanner = scanner
    this.swarm = swarm

    // populate with well-known addresses
    this.swarm.item("0x0000000000000000000000000000000000000000", { name: "Null" });
  }

  async tokenTransfers(address: string) {
    const res = await this.scanner.accountTokenTransfers(address);
    const transfers = res.result;

    for (const transfer of transfers) {
      transfer.contractAddress = this.swarm.item(transfer.contractAddress);
      transfer.from = this.swarm.item(transfer.from);
      transfer.to = this.swarm.item(transfer.to);
      transfer.amount = Decimal.fromDigits(transfer.value, transfer.tokenDecimal)
      transfer.amountAsString = transfer.amount.toString(); // Mostly for testing purposes
    }
    return transfers;
  }
}

export class Graph {
  readonly scanner: Scanner;
  readonly swarm: Swarm;

  constructor(scanner: Scanner) {
    this.scanner = scanner;
    this.swarm = new Swarm();
  }

  get account() {
    return new Account(this.scanner, this.swarm);
  }
}
