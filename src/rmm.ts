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

class Account {
  readonly scanner: Scanner;
  readonly graph: Graph;

  constructor(scanner: Scanner, graph: Graph) {
    this.scanner = scanner
    this.graph = graph
  }

  async tokenTransfers(address: string) {
    const res = await this.scanner.accountTokenTransfers(address);
    const transfers = res.result;

    const contracts = this.graph.swarm("contract");
    const addresses = this.graph.swarm("address");
    for (const transfer of transfers) {
      transfer.contractAddress = contracts.item(transfer.contractAddress);
      transfer.from = addresses.item(transfer.from);
      transfer.to = addresses.item(transfer.to);
    }
    return transfers;
  }
}

export class Graph {
  readonly scanner: Scanner;
  readonly swarms: Map<string, Swarm>;

  constructor(scanner: Scanner) {
    this.scanner = scanner;
    this.swarms = new Map();
  }

  swarm(key: string): Swarm {
    let swarm = this.swarms.get(key);
    if (swarm === undefined) {
      swarm = new Swarm();
      this.swarms.set(key, swarm);
    }

    return swarm;
  }

  get account() {
    return new Account(this.scanner, this);
  }
}
