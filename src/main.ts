import { Client, fetchExchange } from '@urql/core';

const THEGRAPH_API_KEY=process.env.THEGRAPH_API_KEY
const MY_WALLET=process.env.MY_WALLET
const QUERY = `
	query MyQuery($id: ID!) {
	  userTransactions(where: {user: $id}) {
	    id
	    timestamp
	    action
	    ... on Supply {
	      id
	      amount
	      reserve {
		id
	      }
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
	const result = await client.query(QUERY, {
		id: MY_WALLET,
	});
	console.dir(result, {depth: 5});
}

main()
