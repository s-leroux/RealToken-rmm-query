import { Decimal } from "../src/decimal"
import { assert } from 'chai'

describe("Decimal", () => {
  describe("fromInteger", () => {
    const good = [
      [ "000", "0" ],
      [ "12345", "12345" ],

      [ "108904931320097651", "108904931320097651" ],
    ];

    const bad = [
      [ "abc" ],
      [ "123abc" ],
    ]

    for (const [value, expected] of good) {
      it(`should accept ${value} as ${expected}`, () => {
        const actual = Decimal.fromInteger(value);
        assert.equal(actual.toString(), expected);
      });
    }
    for (const [value] of bad) {
      it(`should reject ${value}`, () => {
        assert.throws(() => Decimal.fromInteger(value));
      });
    }
  });

  describe("fromDigits", () => {
    const good = [
      [ "12345", "0", "12345" ],
      [ "12345", "1", "1234.5" ],
      [ "12345", "2", "123.45" ],
      [ "12345", "3", "12.345" ],
      [ "12345", "4", "1.2345" ],
      [ "12345", "5", "0.12345" ],
      [ "12345", "6", "0.012345" ],
      [ "12345", "7", "0.0012345" ],

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
