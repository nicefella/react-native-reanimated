/* global _WORKLET */
/**
 * Copied from:
 * react-native/Libraries/StyleSheet/normalizeColor.js
 * react-native/Libraries/StyleSheet/processColor.js
 * https://github.com/wcandillon/react-native-redash/blob/master/src/Colors.ts
 */

/* eslint no-bitwise: 0 */

import { Platform } from 'react-native';
import { makeRemote, makeShareable } from '../core';
import { Extrapolate } from './extrapolate';
import interpolateNumber from './number';

// var INTEGER = '[-+]?\\d+';
const NUMBER = '[-+]?\\d*\\.?\\d+';
const PERCENTAGE = NUMBER + '%';

function call(...args) {
  'worklet';
  return '\\(\\s*(' + args.join(')\\s*,\\s*(') + ')\\s*\\)';
}

// matchers use RegExp objects which needs to be created separately on JS and on
// the UI thread. We keep separate cache of Regexes for UI and JS using the below
// objects, then pick the right cache in getMatchers() method.
const jsCachedMatchers = {};
const uiCachedMatchers = makeRemote({});

function getMatchers() {
  'worklet';
  const cachedMatchers = _WORKLET ? uiCachedMatchers : jsCachedMatchers;
  if (cachedMatchers.rgb === undefined) {
    cachedMatchers.rgb = new RegExp('rgb' + call(NUMBER, NUMBER, NUMBER));
    cachedMatchers.rgba = new RegExp(
      'rgba' + call(NUMBER, NUMBER, NUMBER, NUMBER)
    );
    cachedMatchers.hsl = new RegExp(
      'hsl' + call(NUMBER, PERCENTAGE, PERCENTAGE)
    );
    cachedMatchers.hsla = new RegExp(
      'hsla' + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER)
    );
    cachedMatchers.hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
    cachedMatchers.hex4 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
    cachedMatchers.hex6 = /^#([0-9a-fA-F]{6})$/;
    cachedMatchers.hex8 = /^#([0-9a-fA-F]{8})$/;
  }
  return cachedMatchers;
}

function hue2rgb(p, q, t) {
  'worklet';
  if (t < 0) {
    t += 1;
  }
  if (t > 1) {
    t -= 1;
  }
  if (t < 1 / 6) {
    return p + (q - p) * 6 * t;
  }
  if (t < 1 / 2) {
    return q;
  }
  if (t < 2 / 3) {
    return p + (q - p) * (2 / 3 - t) * 6;
  }
  return p;
}

function hslToRgb(h, s, l) {
  'worklet';
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);

  return (
    (Math.round(r * 255) << 24) |
    (Math.round(g * 255) << 16) |
    (Math.round(b * 255) << 8)
  );
}

function parse255(str) {
  'worklet';
  const int = Number.parseInt(str, 10);
  if (int < 0) {
    return 0;
  }
  if (int > 255) {
    return 255;
  }
  return int;
}

function parse360(str) {
  'worklet';
  const int = Number.parseFloat(str);
  return (((int % 360) + 360) % 360) / 360;
}

function parse1(str) {
  'worklet';
  const num = Number.parseFloat(str);
  if (num < 0) {
    return 0;
  }
  if (num > 1) {
    return 255;
  }
  return Math.round(num * 255);
}

function parsePercentage(str) {
  'worklet';
  // parseFloat conveniently ignores the final %
  const int = Number.parseFloat(str);
  if (int < 0) {
    return 0;
  }
  if (int > 100) {
    return 1;
  }
  return int / 100;
}

const names = makeShareable({
  transparent: 0x00000000,

  // http://www.w3.org/TR/css3-color/#svg-color
  aliceblue: 0xf0f8ffff,
  antiquewhite: 0xfaebd7ff,
  aqua: 0x00ffffff,
  aquamarine: 0x7fffd4ff,
  azure: 0xf0ffffff,
  beige: 0xf5f5dcff,
  bisque: 0xffe4c4ff,
  black: 0x000000ff,
  blanchedalmond: 0xffebcdff,
  blue: 0x0000ffff,
  blueviolet: 0x8a2be2ff,
  brown: 0xa52a2aff,
  burlywood: 0xdeb887ff,
  burntsienna: 0xea7e5dff,
  cadetblue: 0x5f9ea0ff,
  chartreuse: 0x7fff00ff,
  chocolate: 0xd2691eff,
  coral: 0xff7f50ff,
  cornflowerblue: 0x6495edff,
  cornsilk: 0xfff8dcff,
  crimson: 0xdc143cff,
  cyan: 0x00ffffff,
  darkblue: 0x00008bff,
  darkcyan: 0x008b8bff,
  darkgoldenrod: 0xb8860bff,
  darkgray: 0xa9a9a9ff,
  darkgreen: 0x006400ff,
  darkgrey: 0xa9a9a9ff,
  darkkhaki: 0xbdb76bff,
  darkmagenta: 0x8b008bff,
  darkolivegreen: 0x556b2fff,
  darkorange: 0xff8c00ff,
  darkorchid: 0x9932ccff,
  darkred: 0x8b0000ff,
  darksalmon: 0xe9967aff,
  darkseagreen: 0x8fbc8fff,
  darkslateblue: 0x483d8bff,
  darkslategray: 0x2f4f4fff,
  darkslategrey: 0x2f4f4fff,
  darkturquoise: 0x00ced1ff,
  darkviolet: 0x9400d3ff,
  deeppink: 0xff1493ff,
  deepskyblue: 0x00bfffff,
  dimgray: 0x696969ff,
  dimgrey: 0x696969ff,
  dodgerblue: 0x1e90ffff,
  firebrick: 0xb22222ff,
  floralwhite: 0xfffaf0ff,
  forestgreen: 0x228b22ff,
  fuchsia: 0xff00ffff,
  gainsboro: 0xdcdcdcff,
  ghostwhite: 0xf8f8ffff,
  gold: 0xffd700ff,
  goldenrod: 0xdaa520ff,
  gray: 0x808080ff,
  green: 0x008000ff,
  greenyellow: 0xadff2fff,
  grey: 0x808080ff,
  honeydew: 0xf0fff0ff,
  hotpink: 0xff69b4ff,
  indianred: 0xcd5c5cff,
  indigo: 0x4b0082ff,
  ivory: 0xfffff0ff,
  khaki: 0xf0e68cff,
  lavender: 0xe6e6faff,
  lavenderblush: 0xfff0f5ff,
  lawngreen: 0x7cfc00ff,
  lemonchiffon: 0xfffacdff,
  lightblue: 0xadd8e6ff,
  lightcoral: 0xf08080ff,
  lightcyan: 0xe0ffffff,
  lightgoldenrodyellow: 0xfafad2ff,
  lightgray: 0xd3d3d3ff,
  lightgreen: 0x90ee90ff,
  lightgrey: 0xd3d3d3ff,
  lightpink: 0xffb6c1ff,
  lightsalmon: 0xffa07aff,
  lightseagreen: 0x20b2aaff,
  lightskyblue: 0x87cefaff,
  lightslategray: 0x778899ff,
  lightslategrey: 0x778899ff,
  lightsteelblue: 0xb0c4deff,
  lightyellow: 0xffffe0ff,
  lime: 0x00ff00ff,
  limegreen: 0x32cd32ff,
  linen: 0xfaf0e6ff,
  magenta: 0xff00ffff,
  maroon: 0x800000ff,
  mediumaquamarine: 0x66cdaaff,
  mediumblue: 0x0000cdff,
  mediumorchid: 0xba55d3ff,
  mediumpurple: 0x9370dbff,
  mediumseagreen: 0x3cb371ff,
  mediumslateblue: 0x7b68eeff,
  mediumspringgreen: 0x00fa9aff,
  mediumturquoise: 0x48d1ccff,
  mediumvioletred: 0xc71585ff,
  midnightblue: 0x191970ff,
  mintcream: 0xf5fffaff,
  mistyrose: 0xffe4e1ff,
  moccasin: 0xffe4b5ff,
  navajowhite: 0xffdeadff,
  navy: 0x000080ff,
  oldlace: 0xfdf5e6ff,
  olive: 0x808000ff,
  olivedrab: 0x6b8e23ff,
  orange: 0xffa500ff,
  orangered: 0xff4500ff,
  orchid: 0xda70d6ff,
  palegoldenrod: 0xeee8aaff,
  palegreen: 0x98fb98ff,
  paleturquoise: 0xafeeeeff,
  palevioletred: 0xdb7093ff,
  papayawhip: 0xffefd5ff,
  peachpuff: 0xffdab9ff,
  peru: 0xcd853fff,
  pink: 0xffc0cbff,
  plum: 0xdda0ddff,
  powderblue: 0xb0e0e6ff,
  purple: 0x800080ff,
  rebeccapurple: 0x663399ff,
  red: 0xff0000ff,
  rosybrown: 0xbc8f8fff,
  royalblue: 0x4169e1ff,
  saddlebrown: 0x8b4513ff,
  salmon: 0xfa8072ff,
  sandybrown: 0xf4a460ff,
  seagreen: 0x2e8b57ff,
  seashell: 0xfff5eeff,
  sienna: 0xa0522dff,
  silver: 0xc0c0c0ff,
  skyblue: 0x87ceebff,
  slateblue: 0x6a5acdff,
  slategray: 0x708090ff,
  slategrey: 0x708090ff,
  snow: 0xfffafaff,
  springgreen: 0x00ff7fff,
  steelblue: 0x4682b4ff,
  tan: 0xd2b48cff,
  teal: 0x008080ff,
  thistle: 0xd8bfd8ff,
  tomato: 0xff6347ff,
  turquoise: 0x40e0d0ff,
  violet: 0xee82eeff,
  wheat: 0xf5deb3ff,
  white: 0xffffffff,
  whitesmoke: 0xf5f5f5ff,
  yellow: 0xffff00ff,
  yellowgreen: 0x9acd32ff,
});

function normalizeColor(color) {
  'worklet';

  const matchers = getMatchers();

  let match;

  if (typeof color === 'number') {
    if (color >>> 0 === color && color >= 0 && color <= 0xffffffff) {
      return color;
    }
    return null;
  }

  if (typeof color !== 'string') {
    return null;
  }

  // Ordered based on occurrences on Facebook codebase
  if ((match = matchers.hex6.exec(color))) {
    return Number.parseInt(match[1] + 'ff', 16) >>> 0;
  }

  if (names[color] !== undefined) {
    return names[color];
  }

  if ((match = matchers.rgb.exec(color))) {
    return (
      // b
      ((parse255(match[1]) << 24) | // r
      (parse255(match[2]) << 16) | // g
        (parse255(match[3]) << 8) |
        0x000000ff) >>> // a
      0
    );
  }

  if ((match = matchers.rgba.exec(color))) {
    return (
      // b
      ((parse255(match[1]) << 24) | // r
      (parse255(match[2]) << 16) | // g
        (parse255(match[3]) << 8) |
        parse1(match[4])) >>> // a
      0
    );
  }

  if ((match = matchers.hex3.exec(color))) {
    return (
      Number.parseInt(
        match[1] +
        match[1] + // r
        match[2] +
        match[2] + // g
        match[3] +
        match[3] + // b
          'ff', // a
        16
      ) >>> 0
    );
  }

  // https://drafts.csswg.org/css-color-4/#hex-notation
  if ((match = matchers.hex8.exec(color))) {
    return Number.parseInt(match[1], 16) >>> 0;
  }

  if ((match = matchers.hex4.exec(color))) {
    return (
      Number.parseInt(
        match[1] +
        match[1] + // r
        match[2] +
        match[2] + // g
        match[3] +
        match[3] + // b
          match[4] +
          match[4], // a
        16
      ) >>> 0
    );
  }

  if ((match = matchers.hsl.exec(color))) {
    return (
      (hslToRgb(
        parse360(match[1]), // h
        parsePercentage(match[2]), // s
        parsePercentage(match[3]) // l
      ) |
        0x000000ff) >>> // a
      0
    );
  }

  if ((match = matchers.hsla.exec(color))) {
    return (
      (hslToRgb(
        parse360(match[1]), // h
        parsePercentage(match[2]), // s
        parsePercentage(match[3]) // l
      ) |
        parse1(match[4])) >>> // a
      0
    );
  }

  return null;
}

export function processColor(color) {
  'worklet';
  if (color === null || color === undefined || typeof color === 'number') {
    return color;
  }

  let normalizedColor = normalizeColor(color);

  if (normalizedColor === null || normalizedColor === undefined) {
    return undefined;
  }

  if (typeof normalizedColor !== 'number') {
    return null;
  }

  normalizedColor = ((normalizedColor << 24) | (normalizedColor >>> 8)) >>> 0;

  if (Platform.OS === 'android') {
    // Android use 32 bit *signed* integer to represent the color
    // We utilize the fact that bitwise operations in JS also operates on
    // signed 32 bit integers, so that we can use those to convert from
    // *unsigned* to *signed* 32bit int that way.
    normalizedColor = normalizedColor | 0x0;
  }

  return normalizedColor;
}

export const ColorSpace = Object.freeze({
  RGB: 'rgb',
  HSV: 'hsv',
});

const fract = (v) => {
  'worklet';
  return v - Math.floor(v);
};

export const opacity = (c) => {
  'worklet';
  return ((c >> 24) & 255) / 255;
};

export const red = (c) => {
  'worklet';
  return (c >> 16) & 255;
};

export const green = (c) => {
  'worklet';
  return (c >> 8) & 255;
};

export const blue = (c) => {
  'worklet';
  return c & 255;
};

const mix = (value, x, y) => {
  'worklet';
  return x + value * (y - x);
};
const clamp = (value, lowerBound, upperBound) => {
  'worklet';
  return Math.min(Math.max(lowerBound, value), upperBound);
};

export const rgbaColor = (r, g, b, alpha = 1) => {
  'worklet';
 // if (Platform.OS === 'web' || !_WORKLET) {
  if (Platform.OS === 'web') {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const a = alpha * 255;
  const c =
    a * (1 << 24) +
    Math.round(r) * (1 << 16) +
    Math.round(g) * (1 << 8) +
    Math.round(b);
  if (Platform.OS === 'android') {
    // on Android color is represented as signed 32 bit int
    return c < (1 << 31) >>> 0 ? c : c - Math.pow(2, 32);
  }
  return c;
};

export const hsv2rgb = (h, s, v) => {
  'worklet';
  // vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  const K = {
    x: 1,
    y: 2 / 3,
    z: 1 / 3,
    w: 3,
  };
  // vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  const p = {
    x: Math.abs(fract(h + K.x) * 6 - K.w),
    y: Math.abs(fract(h + K.y) * 6 - K.w),
    z: Math.abs(fract(h + K.z) * 6 - K.w),
  };
  // return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  const rgb = {
    x: v * mix(s, K.x, clamp(p.x - K.x, 0, 1)),
    y: v * mix(s, K.x, clamp(p.y - K.x, 0, 1)),
    z: v * mix(s, K.x, clamp(p.z - K.x, 0, 1)),
  };
  return {
    r: Math.round(rgb.x * 255),
    g: Math.round(rgb.y * 255),
    b: Math.round(rgb.z * 255),
  };
};

export const hsv2color = (h, s, v) => {
  'worklet';
  const { r, g, b } = hsv2rgb(h, s, v);
  return rgbaColor(r, g, b);
};

export const colorForBackground = (r, g, b) => {
  'worklet';
  const L = 0.299 * r + 0.587 * g + 0.114 * b;
  return L > 186 ? 0x000000ff : 0xffffffff;
};

const rgbToHsv = (c) => {
  'worklet';
  const r = red(c) / 255;
  const g = green(c) / 255;
  const b = blue(c) / 255;

  const ma = Math.max(r, g, b);
  const mi = Math.min(r, g, b);
  let h = 0;
  const v = ma;

  const d = ma - mi;
  const s = ma === 0 ? 0 : d / ma;
  if (ma === mi) {
    h = 0; // achromatic
  } else {
    switch (ma) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h, s, v };
};

const interpolateColorsHSV = (value, inputRange, colors) => {
  'worklet';
  const colorsAsHSV = colors.map((c) => rgbToHsv(c));
  const h = interpolateNumber(
    value,
    inputRange,
    colorsAsHSV.map((c) => c.h),
    Extrapolate.CLAMP
  );
  const s = interpolateNumber(
    value,
    inputRange,
    colorsAsHSV.map((c) => c.s),
    Extrapolate.CLAMP
  );
  const v = interpolateNumber(
    value,
    inputRange,
    colorsAsHSV.map((c) => c.v),
    Extrapolate.CLAMP
  );
  return hsv2color(h, s, v);
};

const interpolateColorsRGB = (value, inputRange, colors) => {
  'worklet';
  const rm = colors.map((c) => red(c));
  const r = Math.round(
    interpolateNumber(
      value,
      inputRange[0],
      inputRange[1],
      rm[0],
      rm[1],
      Extrapolate.CLAMP
    )
  );
  const gm = colors.map((c) => green(c));
  const g = Math.round(
    interpolateNumber(
      value,
      inputRange[0],
      inputRange[1],
      gm[0],
      gm[1],
      Extrapolate.CLAMP
    )
  );
  const bm = colors.map((c) => blue(c));
  const b = Math.round(
    interpolateNumber(
      value,
      inputRange[0],
      inputRange[1],
      bm[0],
      bm[1],
      Extrapolate.CLAMP
    )
  );
  const om = colors.map((c) => opacity(c));
  const a = interpolateNumber(
    value,
    inputRange[0],
    inputRange[1],
    om[0],
    om[1],
    Extrapolate.CLAMP
  );
  return rgbaColor(r, g, b, a);
};

export const interpolateColor = (
  value,
  inputRange,
  outputRange,
  colorSpace = ColorSpace.RGB
) => {
  'worklet';
  outputRange = outputRange.map((c) => processColor(c));
  console.log(outputRange, inputRange);
  if (colorSpace === ColorSpace.HSV) {
    return interpolateColorsHSV(value, inputRange, outputRange);
  }
  return interpolateColorsRGB(value, inputRange, outputRange);
};

/* import constant from './constant.js';

function linear(a, d) {
  return function (t) {
    return a + t * d;
  };
}

function exponential(a, b, y) {
  return (
    (a = Math.pow(a, y)),
    (b = Math.pow(b, y) - a),
    (y = 1 / y),
    function (t) {
      return Math.pow(a + t * b, y);
    }
  );
}

export function hue(a, b) {
  var d = b - a;
  return d
    ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d)
    : constant(isNaN(a) ? b : a);
}

export function gamma(y) {
  return (y = +y) === 1
    ? nogamma
    : function (a, b) {
        return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
      };
}

export default function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant(isNaN(a) ? b : a);
}
 */
