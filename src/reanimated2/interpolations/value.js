import { processColor } from './color';
import { isNumberArray } from './numberArray';

export default function interpolateValue(v, l, r, a, b, type) {
  'worklet';
  var t = typeof b;
  var c;
  if (t === 'boolean' || t === null) {
    return this.interpolateConstant.apply(this, [b]);
  }
  if (t === 'number') {
    return this.interpolateNumber.apply(this, [v, l, r, a, b, type]);
  }
  if (t === 'string') {
    c = processColor(b);
    if (c) {
      return this.interpolateColor.apply(this, [v, [0,1], [a, c]]);
    } else {
      // return this.interpolateString.apply(this, [v, a, b]);
      return b;
    }
  }
  if (b instanceof Date) {
    return this.interpolateDate.apply(this, [v, a, b]);
  }
  if (isNumberArray(b)) {
    return this.interpolateNumberArray.apply(this, [v, a, b]);
  }
  if (Array.isArray(b)) {
    return this.interpolateGenericArray.apply(this, [v, a, b]);
  }
  if (
    t === 'object' ||
    (typeof b.valueOf !== 'function' && typeof b.toString !== 'function') ||
    isNaN(b)
  ) {
    return this.interpolateObject.apply(this, [v, a, b, type]);
  }
  return b;
  // return this.interpolateNumber.apply(this, [v, l, r, a, b, type]);
}
