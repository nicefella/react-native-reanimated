export default function(t, a, b) {
  'worklet';
  var d = new Date();
  a = +a;
  b = +b;
  d.setTime(a * (1 - t) + b * t);
  return d;
}
