import { Decimal as BigNumber } from "decimal.js"

function toInt(src: number|string) {
  const result = parseInt(src.toString())

  if (src != result) {
    throw new TypeError(`Can't convert ${src} to an integer`);
  }

  return result;
}

export const Decimal = {
  fromInteger(v: number|string) {
    return new BigNumber(v);
  },

  fromDigits(digits: number|string, precision: number|string) {
    const precisionAsInteger = toInt(precision);
    if (precisionAsInteger === 0) {
      return this.fromInteger(digits);
    }

    const digitsAsString = digits.toString()
    const amount =
      digitsAsString.slice(0, -precisionAsInteger)
      + "."
      + digitsAsString.slice(-precisionAsInteger);
    return new BigNumber(amount);
  },

}

