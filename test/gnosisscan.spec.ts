import { Provider, GnosisScan } from "../src/service/gnosisscan"
import { assert } from 'chai'

describe("The GnosisScan provider", () => {
  let provider = null;
  let gs = null;

  beforeEach(function() {
    this.timeout(5000);
    provider = new Provider(process.env["GNOSISSCAN_API_KEY"]);
    gs = new GnosisScan(provider);
  });

  it('should query the API', async () => {
    const res = await gs.blockNoByTime(1578638524);

    assert.deepEqual(res, {
      "status": "1",
      "message": "OK",
      "result": "7781276"
    });
  });

  it('should retry query if we hit the rate limit', async function() {
    this.timeout(0);
    assert.equal(provider.retries, 0);
    await Promise.all([
      gs.blockNoByTime(1578638524),
      gs.blockNoByTime(1578638524),
      gs.blockNoByTime(1578638524),
      gs.blockNoByTime(1578638524),
      gs.blockNoByTime(1578638524),
      gs.blockNoByTime(1578638524),
      gs.blockNoByTime(1578638524),
    ]);
    assert.isAbove(provider.retries, 0);
  });
})
