const Extrapolate = {
  EXTEND: 'extend',
  CLAMP: 'clamp',
  IDENTITY: 'identity',
};

export default function interpolateNumber(x, l, r, ll, rr, type) {
  'worklet';
  if (r - l === 0) {
    return ll;
  }

  const progress = (x - l) / (r - l);
  const val = ll + progress * (rr - ll);
  const coef = rr >= ll ? 1 : -1;

  // TODO: support default values in worklets:
  // e.g. function interplate(x, input, output, type = Extrapolate.CLAMP)
  type = type || Extrapolate.EXTEND;

  if (coef * val < coef * ll || coef * val > coef * rr) {
    switch (type) {
      case Extrapolate.IDENTITY:
        return x;
      case Extrapolate.CLAMP:
        if (coef * val < coef * ll) {
          return ll;
        }
        return rr;
      case Extrapolate.EXTEND:
      default:
        return val;
    }
  }
  return val;
}

/**
 * from d3-interpolate
 */
/* export default function(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
} */
