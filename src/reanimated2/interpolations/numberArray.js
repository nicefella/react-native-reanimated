export default function (t, a, b) {
  'worklet';
  if (!b) {
    b = [];
  }
  var n = a ? Math.min(b.length, a.length) : 0,
    c = b.slice(),
    i;

  for (i = 0; i < n; ++i) {
    c[i] = a[i] * (1 - t) + b[i] * t;
  }
  return c;
}

export function isNumberArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}
