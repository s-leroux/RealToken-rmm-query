import { Scanner } from "./rmm"

const MY_WALLET=process.env.MY_WALLET
const GNOSISSCAN_API_KEY=process.env.GNOSISSCAN_API_KEY

async function testGnosisFetch() {
  const scanner = new Scanner(GNOSISSCAN_API_KEY)

  return await scanner.accountTokenTransfers(MY_WALLET)
}

async function main() {
  console.dir(process.env);

  console.log(await testGnosisFetch());
}

main()
