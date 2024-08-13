import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'node:url';
import { GnosisScan } from './service/gnosisscan';
import { Ledger } from "./ledger";

const GNOSIS_NATIVE_COIN_DECIMALS=18

import { NormalTransaction, InternalTransaction, ERC20TokenTransfer } from "./transaction";
import { Swarm } from "./swarm";
import { Decimal, toInteger } from "./decimal";

class Account {
  readonly scanner: GnosisScan;
  readonly swarm: Swarm;
  readonly address;

  constructor(scanner: GnosisScan, swarm: Swarm, address: string) {
    this.scanner = scanner
    this.swarm = swarm
    this.address = address

    // populate with well-known addresses
    this.swarm.item("0x0000000000000000000000000000000000000000", { name: "Null" });
  }

  async normalTransactions() {
    const res = await this.scanner.accountNormalTransactions(this.address);

    return Ledger.create(
      res.result
        .filter(tr => tr.isError === "0")
        .map((t) => new NormalTransaction(this.swarm, t))
    );
  }

  async internalTransactions() {
    const res = await this.scanner.accountInternalTransactions(this.address);

    return Ledger.create(
      res.result
        .filter(tr => tr.isError === "0")
        .map((t) => new InternalTransaction(this.swarm, t))
    );
  }

  async tokenTransfers() {
    const res = await this.scanner.accountTokenTransfers(this.address);

    return Ledger.create(
      res.result
        .map((t) => new ERC20TokenTransfer(this.swarm, t))
    );
  }

  async allTransfers() {
    /*
     * Merge {normal, internal, token} transfers in one single list ordered by timestamp.
     */

    // naive implementation
    const [normal, internal, erc20] = await Promise.all([
      this.normalTransactions(),
      this.internalTransactions(),
      this.tokenTransfers(),
    ]);

    return Ledger.create(normal).union(internal).union(erc20);
  }
}

export class Graph {
  readonly scanner: GnosisScan;
  readonly swarm: Swarm;

  constructor(scanner: GnosisScan) {
    this.scanner = scanner;
    this.swarm = new Swarm();
  }

  account(address: string) {
    return new Account(this.scanner, this.swarm, address);
  }
}
