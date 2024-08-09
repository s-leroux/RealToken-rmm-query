import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'node:url';

const GNOSISSCAN_BASE_ADDRESS='https://api.gnosisscan.io/api'
const GNOSISSCAN_DEFAULT_RETRY=Infinity
const GNOSISSCAN_DEFAULT_COOLDOWN=1000

const GNOSIS_NATIVE_COIN_DECIMALS=18

interface ProviderInterface {
  fetch(params): Promise<object>;
}

export class Provider implements ProviderInterface {
  /**
   * Interface to the webservice provider.
   */
  readonly origin: string;
  readonly api_key: string;
  readonly retry: number;
  readonly cooldown: number;

  // statistics
  retries: number; // How many time did we retry a request because or rate-limit

  constructor(
    api_key: string, 
    origin: string = GNOSISSCAN_BASE_ADDRESS,
    options = {} as any,
  ) {
    this.origin = origin;
    this.api_key = api_key;
    this.retry = options.retry ?? GNOSISSCAN_DEFAULT_RETRY
    this.cooldown = options.cooldown ?? GNOSISSCAN_DEFAULT_COOLDOWN
    this.retries = 0;
  }

  buildUrl(params): URL {
    const url = new URL(this.origin);
    const search_params = new URLSearchParams(params);
    search_params.set('apiKey', this.api_key);
    url.search = search_params.toString()

    return url;
  }

  async fetch(params) {
    let retry = this.retry;
    const url = this.buildUrl(params);

    while (true) {
      const res = await fetch(url);
      const json = await res.json();

      // GnosisScan returns errors with the 200 status code, but an error description in the body
      if (json.status === "0") {
        // it's an error

        // check if this is rate-limit and we can retry
        if (json.result.startsWith("Max rate limit reached") && (retry-- > 0)) {
          await new Promise(r => setTimeout(r, this.cooldown));
          ++this.retries;
          continue;
        }

        throw new Error(json.result);
      }

      return json;
    }
    
  }
};

export class GnosisScan {
  readonly provider

  constructor(provider: ProviderInterface) {
    this.provider = provider
  }

  static create(api_key: string, origin: string = GNOSISSCAN_BASE_ADDRESS, options = {} as any) {
    return new GnosisScan(new Provider(api_key, origin, options));
  }

  async blockNoByTime(timestamp: number, closest: "before" | "after" = "before") {
    const params = {
      module: 'block',
      action: 'getblocknobytime',
      timestamp: timestamp,
      closest: closest,
    }

    return await this.provider.fetch(params)
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
    return await this.provider.fetch(params)
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
    return await this.provider.fetch(params)
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
    return await this.provider.fetch(params)
  }
}

