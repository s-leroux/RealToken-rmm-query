import { Decimal as BigNumber } from "decimal.js"

export const Decimal = {
  fromDigits(digits: number|string, precision: number|string) {
    const digitsAsString = digits.toString()
    const precisionAsInteger = parseInt(precision.toString())

    if (precision != precisionAsInteger) {
      throw new TypeError(`Invalid decimals (found ${precision})`);
    }
    if (precisionAsInteger === 0) {
      return new BigNumber(digits);
    }

    // else
    const amount =
      digitsAsString.slice(0, -precisionAsInteger)
      + "."
      + digitsAsString.slice(-precisionAsInteger);
    return new BigNumber(amount);
  },

}

