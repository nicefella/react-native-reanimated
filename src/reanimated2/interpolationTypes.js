const Extrapolate = {
  EXTEND: 'extend',
  CLAMP: 'clamp',
  IDENTITY: 'identity',
};

export function internalInterpolate(x, l, r, ll, rr, type) {
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

export function internalInterpolateValue(v, l, r, a, b, type) {
  'worklet';
  var t = typeof b;
  // var c;

//  console.log('typeof', t, v, a, b, type);
  if (t === 'number') {
   //   console.log('evaluated number', v, a, b, type);
    return internalInterpolate(v, l, r, a, b, type);
  }
  /*   if (Array.isArray(b)) {
      return internalInterpolateRGBColor(v,a,b,type);
    }
    if (t === 'string' && b.substring(0,5) === 'rgba(') {
      return internalInterpolateRGBColor(v,a,b,type);
    } */
  if (t === 'object') {
     console.log('evaluated object', v, a, b, type, internalInterpolateObject);
      return internalInterpolateObject(v,a,b,type);
   // return internalInterpolateObject.apply({}, [v, a, b, type]);
  }

  //console.log('not evaluated', v, a, b, type);

  return b;

  /*   return b == null || t === "boolean" ? constant(b)
        : (t === "number" ? number
        : t === "string" ? ((c = color(b)) ? (b = c, rgb) : string)
        : b instanceof color ? rgb
        : b instanceof Date ? date
        : isNumberArray(b) ? numberArray
        : Array.isArray(b) ? genericArray
        : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
        : number)(a, b); */
}

export function internalInterpolateObject(t, a, b, type) {
  'worklet';
  var i = {};
  var c = {};
  var k;

   console.log('internalInterpolateObject begin', t, a, b, type);

  if (a === null || typeof a !== 'object') {
    a = {};
  }
  if (b === null || typeof b !== 'object') {
    b = {};
  }

  for (k in b) {
    if (k in a) {
    //   console.log('inner internalInterpolateValue', t, a[k], b[k]);
      i[k] = internalInterpolateValue(t, 0, 1, a[k], b[k], type);
    } else {
      c[k] = b[k];
    }
  }

  for (k in i) {
    c[k] = i[k];
  }
  return c;
}
