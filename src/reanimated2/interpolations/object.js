export default function interpolateObject(t, a, b, type) {
  'worklet';
  var i = {};
  var c = {};
  var k;

  if (a === null || typeof a !== 'object') {
    a = {};
  }
  if (b === null || typeof b !== 'object') {
    b = {};
  }

  for (k in b) {
    if (k in a) {
      i[k] = this.interpolateValue.apply(this, [t, 0, 1, a[k], b[k], type]);
    } else {
      c[k] = b[k];
    }
  }

  for (k in i) {
    c[k] = i[k];
  }
  return c;
}
