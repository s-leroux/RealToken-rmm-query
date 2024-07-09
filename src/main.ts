const MY_WALLET=process.env.MY_WALLET

import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'node:url'; 

const GNOSISSCAN_API_KEY=process.env.GNOSISSCAN_API_KEY
const GNOSISSCAN_BASE_ADDRESS='https://api.gnosisscan.io/api'

function gnosisAPIUrl(params) {
  const url = new URL(GNOSISSCAN_BASE_ADDRESS);
  const search_params = new URLSearchParams(params);
  url.search = search_params.toString()

  return url;
}

async function gnosisFetch(params) {
  const url = gnosisAPIUrl(params);
  const res = await fetch(url);

  return await res.json();
}

async function gnosisAccountTransactions() {
  const params = {
    module: 'account',
    action: 'txlist',
    startBlock: 0,
    endBlock: 99999999,
    sort: 'asc',
    address: MY_WALLET,
    apiKey: GNOSISSCAN_API_KEY,
  }
  return await gnosisFetch(params)
}

async function gnosisAccountTokenTransfers() {
  const params = {
    module: 'account',
    action: 'tokentx',
    startBlock: 0,
    endBlock: 99999999,
    sort: 'asc',
    address: MY_WALLET,
    apiKey: GNOSISSCAN_API_KEY,
  }
  return await gnosisFetch(params)
}

async function testGnosisFetch() {
  return await gnosisAccountTokenTransfers()
}

import { Client, fetchExchange } from '@urql/core';

const THEGRAPH_API_KEY=process.env.THEGRAPH_API_KEY
const QUERY = `
  fragment ReserveFields on Reserve {
    name
    decimals
  }

  query MyQuery($id: ID!) {
    userTransactions(
      where: {user: $id}
    ) {
      action
      timestamp
      ... on Supply {
        amount
        assetPriceUSD
        reserve {
          ...ReserveFields
        }
      }
      ... on Repay {
        amount
        assetPriceUSD
        reserve {
          ...ReserveFields
        }
        assetPriceUSD
      }
      ... on RedeemUnderlying {
        amount
        assetPriceUSD
        reserve {
          ...ReserveFields
        }
      }
      ... on Borrow {
        amount
        assetPriceUSD
        reserve {
          ...ReserveFields
        }
      }
      ... on ClaimRewardsCall {
        amount
      }
    }
  }
`

const endpoint = `https://gateway-arbitrum.network.thegraph.com/api/${THEGRAPH_API_KEY}/subgraphs/id/2xrWGGZ5r8Z7wdNdHxhbRVKcAD2dDgv3F2NcjrZmxifJ`
const client = new Client({
  url: endpoint,
  exchanges: [fetchExchange],
});

async function main() {
	console.dir(process.env);
//	const result = await client.query(QUERY, {
//		id: MY_WALLET,
//	});
//        console.dir(result, {depth: 5});

        console.log(await testGnosisFetch());
}

main()
