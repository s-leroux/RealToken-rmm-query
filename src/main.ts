import { Scanner, Graph } from "./rmm"

const MY_WALLET=process.env.MY_WALLET;
const GNOSISSCAN_API_KEY=process.env.GNOSISSCAN_API_KEY;

const RMMV3_SC="0xfb9b496519fca8473fba1af0850b6b8f476bfdb3"
const RMMV3_MISC="0xf215af7efd2d90f7492a13c3147defd7f1b41a8e"
const REALT_ADDRESSES=[
  "0x6af98c59225f43137fd614262278ff7393d0168b",
  "0x1064920b86cff859a8697697a1b2bd0bbdb60b29",
  "0xf74a0a6b0a8e3d69453f05c258afb46429dbd0a2",
]

async function testGnosisFetch() {
  const scanner = new Scanner(GNOSISSCAN_API_KEY);
  const graph = new Graph(scanner);

  graph.swarm.item(MY_WALLET, { name: "My wallet" });
  graph.swarm.item(RMMV3_SC, { name: "RMMv3 Smart Contract" });
  graph.swarm.item(RMMV3_MISC, { name: "RMMv3 Misc" });
  for (const addr of REALT_ADDRESSES) {
    graph.swarm.item(addr, { name: "RealT" });
  }

  const result = await graph.account.tokenTransfers(MY_WALLET);

  console.dir(graph.swarm, { depth: 10 });
  console.dir(result);
}

async function main() {
  console.dir(process.env);

  await testGnosisFetch();
}

main()
