import { Decimal as BigNumber } from "decimal.js"

export function toInteger(src: number|string) {
  const result = parseInt(src.toString())

  if (src != result) {
    throw new TypeError(`Can't convert ${src} to an integer`);
  }

  return result;
}

export {
  BigNumber,
};

export const Decimal = {
  fromInteger(v: number|string) {
    return new BigNumber(v);
  },

  fromDigits(digits: number|string, precision: number|string) {
    const precisionAsInteger = toInteger(precision);
    if (precisionAsInteger === 0) {
      return this.fromInteger(digits);
    }

    return new BigNumber(digits).div(10 ** precisionAsInteger);
  },

 E18: new BigNumber(1e18),
 ZERO: new BigNumber(0),
}

