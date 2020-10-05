import numberArray, { isNumberArray } from './numberArray.js';

export default function(t, a, b) {
  'worklet';
  return (isNumberArray(b) ? numberArray : genericArray)(t, a, b);
}

export function genericArray(t, a, b) {
  'worklet';
  var nb = b ? b.length : 0,
    na = a ? Math.min(nb, a.length) : 0,
    x = new Array(na),
    c = new Array(nb),
    i;

  for (i = 0; i < na; ++i) {
    x[i] = this.interpolateValue.apply(this, [t, 0, 1, a[i], b[i]]);
  }
  for (; i < nb; ++i) {
    c[i] = b[i];
  }

  for (i = 0; i < na; ++i) {
    c[i] = x[i];
  }
  return c;
}
