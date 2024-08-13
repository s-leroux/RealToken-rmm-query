import { Graph } from "./rmm"
import { GnosisScan } from "./service/gnosisscan"

const MY_WALLET=process.env.MY_WALLET;
const GNOSISSCAN_API_KEY=process.env.GNOSISSCAN_API_KEY;

const RMMV3_SC="0xfb9b496519fca8473fba1af0850b6b8f476bfdb3"
const REALT_RENTS="0xf215af7efd2d90f7492a13c3147defd7f1b41a8e"
const REALT_RMMV3XDAI="0x0ca4f5554dd9da6217d62d8df2816c82bba4157b"
const REALT_RMMV3USDC="0xed56f76e9cbc6a64b821e9c016eafbd3db5436d1"

const WELL_KNOWN_ADDRESSES: [string, object][] = [
  [ "0x550a0c95fe1762d9cb553402ccc65bcd71594692", { name: "RealToken S 3522-3526 Harding St Detroit MI" } ],
  [ "0x6af98c59225f43137fd614262278ff7393d0168b", { name: "RealT" } ],
  [ "0x1064920b86cff859a8697697a1b2bd0bbdb60b29", { name: "RealT" } ],
  [ "0xf74a0a6b0a8e3d69453f05c258afb46429dbd0a2", { name: "RealT" } ],

  [ "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83", { name: "USD//C on xDai" } ],
]

import { Snapshot } from "./portfolio";

async function testGnosisFetch() {
  const scanner = GnosisScan.create(GNOSISSCAN_API_KEY);
  const graph = new Graph(scanner);

  graph.swarm.item(MY_WALLET, { name: "My Wallet" });
  graph.swarm.item(RMMV3_SC, { name: "RMMv3 Smart Contract" });
  graph.swarm.item(REALT_RENTS, { name: "RealT Rents" });
  graph.swarm.item(REALT_RMMV3XDAI, { name: "RealT RMM V3 WXDAI" });
  graph.swarm.item(REALT_RMMV3USDC, { name: "RealT RMM V3 USDC" });

  for (const [addr, data] of WELL_KNOWN_ADDRESSES) {
    graph.swarm.item(addr, data);
  }

  const account = graph.account(MY_WALLET);
  const result = await account.allTransfers();

  console.dir(graph.swarm, { depth: 10 });
  let transactionCount = 0;
  for (const t of result) {
    console.log(`Transaction #${transactionCount++}`);
    console.dir(t, { depth: 1 });
  }
  console.log(`${transactionCount} transactions`);

  let last_block = 0
  const snapshots = result.reduce((acc, transfer) => {
    let snapshot = acc;
    if (transfer.to.__id == MY_WALLET) {
      snapshot = snapshot.deposit(transfer.timeStamp, transfer.symbol, transfer.amount);
    }
    if (transfer.from.__id == MY_WALLET) {
      snapshot = snapshot.withdraw(transfer.timeStamp, transfer.symbol, transfer.amount);
      if (transfer.blockNumber !== last_block) {
        last_block = transfer.blockNumber;
        snapshot = snapshot.withdraw(transfer.timeStamp, null, transfer.fees);
      }
    }

    console.log(snapshot);
    return snapshot;
  }, new Snapshot(0));
  return;
  for (const snapshot of snapshots) {
    console.dir(snapshot);
  }

}

async function main() {
  console.dir(process.env);

  await testGnosisFetch();
}

main()
