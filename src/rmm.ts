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

