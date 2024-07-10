import { Decimal } from "../src/decimal"
import { assert } from 'chai'

describe("Decimal", () => {
  describe("fromDigits", () => {
    const good = [
      [ "12345", "0", "12345" ],
      [ "12345", "2", "123.45" ],

      [ "108904931320097651", "18", "0.108904931320097651" ],
    ];

    const bad = [
      [ "abc", "0" ],
      [ "abc", "2" ],
      [ "123abc", "2" ],

      [ "12345", "a" ],
      [ "12345", "2a" ],
    ]

    for (const [digits, precision, expected] of good) {
      it(`should accept ${digits}:${precision} as ${expected}`, () => {
        const actual = Decimal.fromDigits(digits, precision);
        assert.equal(actual.toString(), expected);
      });
    }
    for (const [digits, precision] of bad) {
      it(`should reject ${digits}:${precision}`, () => {
        assert.throws(() => Decimal.fromDigits(digits, precision));
      });
    }
  });
})
