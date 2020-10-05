import interpolateArray, {
  genericArray as interpolateGenericArray,
} from './array';
import interpolateConstant from './constant';
import interpolateDate from './date';
import interpolateNumber from './number';
import interpolateNumberArray from './numberArray';
import interpolateObject from './object';
import interpolateColor from './color';
import interpolateString from './string';
import interpolateValue from './value';

const api = {
  interpolateArray,
  interpolateGenericArray,
  interpolateConstant,
  interpolateDate,
  interpolateNumber,
  interpolateNumberArray,
  interpolateValue,
  interpolateObject,
  interpolateColor,
  interpolateString,
};

export default api;

export function interpolate(x, input, output, type) {
  'worklet';
  if (x && x.__nodeID) {
    throw new Error(
      'Reanimated: interpolate from V1 has been renamed to interpolateNode.',
    );
  }
  const length = input.length;
  let narrowedInput = [];
  if (x < input[0]) {
    narrowedInput = [input[0], input[1], output[0], output[1]];
  } else if (x > input[length - 1]) {
    narrowedInput = [
      input[length - 2],
      input[length - 1],
      output[length - 2],
      output[length - 1],
    ];
  } else {
    for (let i = 1; i < length; ++i) {
      if (x <= input[i]) {
        narrowedInput = [input[i - 1], input[i], output[i - 1], output[i]];
        break;
      }
    }
  }
  return api.interpolateValue.apply(
    api,
    [x].concat(narrowedInput).concat(type),
  );
}
