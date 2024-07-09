import { Scanner, Graph } from "./rmm"

const MY_WALLET=process.env.MY_WALLET;
const GNOSISSCAN_API_KEY=process.env.GNOSISSCAN_API_KEY;

const RMMV3_SC="0xfb9b496519fca8473fba1af0850b6b8f476bfdb3"
const RMMV3_MISC="0xf215af7efd2d90f7492a13c3147defd7f1b41a8e"

async function testGnosisFetch() {
  const scanner = new Scanner(GNOSISSCAN_API_KEY);
  const graph = new Graph(scanner);

  graph.swarm("address").item(MY_WALLET, { name: "My wallet" });
  graph.swarm("contract").item(RMMV3_SC, { name: "RMMv3 Smart Contract" });
  graph.swarm("contract").item(RMMV3_MISC, { name: "RMMv3 Misc" });
  const result = await graph.account.tokenTransfers(MY_WALLET);

  console.dir(graph.swarms, { depth: 10 });
  console.dir(result);
}

async function main() {
  console.dir(process.env);

  await testGnosisFetch();
}

main()
