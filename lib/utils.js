/* eslint-disable no-proto */
const canSetPrototype =
  Object.setPrototypeOf || { __proto__: [] } instanceof Array;
const greedyIntervalPacker = require('greedy-interval-packer');

const setPrototypeOf =
  Object.setPrototypeOf ||
  function setPrototypeOf(obj, proto) {
    obj.__proto__ = proto;
    return obj;
  };
/* eslint-enable no-proto */

const utils = (module.exports = {
  objectIs:
    Object.is ||
    ((a, b) => {
      // Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
      if (a === 0 && b === 0) {
        return 1 / a === 1 / b;
      }
      // eslint-disable-next-line no-self-compare
      if (a !== a) {
        // eslint-disable-next-line no-self-compare
        return b !== b;
      }
      return a === b;
    }),

  duplicateArrayLikeUsingType(obj, type) {
    const keys = type.getKeys(obj);

    let numericalKeyLength = keys.length;
    if (!type.numericalPropertiesOnly) {
      let nonNumericalKeyLength = 0;
      // find non-numerical keys in reverse order to keep iteration minimal
      for (let i = keys.length - 1; i > -1; i -= 1) {
        const key = keys[i];
        if (typeof key === 'symbol' || !utils.numericalRegExp.test(key)) {
          nonNumericalKeyLength += 1;
        } else {
          break;
        }
      }
      // remove non-numerical keys to ensure the copy is sized correctly
      numericalKeyLength -= nonNumericalKeyLength;
    }

    const arr = new Array(numericalKeyLength);

    keys.forEach(function(key, index) {
      const isNonNumericKey = index >= numericalKeyLength;
      if (isNonNumericKey && !type.hasKey(obj, key)) {
        // do not add non-numerical keys that are not actually attached
        // to the array-like to ensure they will be treated as "missing"
        return;
      }
      arr[key] = type.hasKey(obj, key) ? type.valueForKey(obj, key) : undefined;
    });

    return arr;
  },

  isArray(ar) {
    return Object.prototype.toString.call(ar) === '[object Array]';
  },

  isPromise(obj) {
    return obj && typeof obj.then === 'function';
  },

  isRegExp(re) {
    return Object.prototype.toString.call(re) === '[object RegExp]';
  },

  isError(err) {
    return (
      typeof err === 'object' &&
      (Object.prototype.toString.call(err) === '[object Error]' ||
        err instanceof Error)
    );
  },

  extend(target) {
    for (let i = 1; i < arguments.length; i += 1) {
      const source = arguments[i];
      if (source) {
        Object.keys(source).forEach(key => {
          target[key] = source[key];
        });
      }
    }
    return target;
  },

  findFirst(arr, predicate) {
    for (let i = 0; i < arr.length; i += 1) {
      if (predicate(arr[i])) {
        return arr[i];
      }
    }
    return null;
  },

  leftPad(str, width, ch = ' ') {
    while (str.length < width) {
      str = ch + str;
    }
    return str;
  },

  escapeRegExpMetaChars(str) {
    return str.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
  },

  escapeChar(ch) {
    if (ch === '\t') {
      return '\\t';
    } else if (ch === '\r') {
      return '\\r';
    } else {
      const charCode = ch.charCodeAt(0);
      const hexChars = charCode.toString(16).toUpperCase();
      if (charCode < 256) {
        return `\\x${utils.leftPad(hexChars, 2, '0')}`;
      } else {
        return `\\u${utils.leftPad(hexChars, 4, '0')}`;
      }
    }
  },

  getFunctionName(f) {
    if (typeof f.name === 'string') {
      return f.name;
    }
    const matchFunctionName = Function.prototype.toString
      .call(f)
      .match(/function ([^(]+)/);
    if (matchFunctionName) {
      return matchFunctionName[1];
    }

    if (f === Object) {
      return 'Object';
    }
    if (f === Function) {
      return 'Function';
    }
    return '';
  },

  wrapConstructorNameAroundOutput(output, obj) {
    const constructor = obj.constructor;
    const constructorName =
      constructor &&
      constructor !== Object &&
      utils.getFunctionName(constructor);
    if (constructorName && constructorName !== 'Object') {
      return output
        .clone()
        .text(`${constructorName}(`)
        .append(output)
        .text(')');
    } else {
      return output;
    }
  },

  setPrototypeOfOrExtend: canSetPrototype
    ? setPrototypeOf
    : function extend(target, source) {
        for (const prop in source) {
          if (source.hasOwnProperty(prop)) {
            target[prop] = source[prop];
          }
        }
        return target;
      },

  uniqueStringsAndSymbols(...args) {
    // [filterFn], item1, item2...
    let filterFn;
    if (typeof args[0] === 'function') {
      filterFn = args[0];
    }
    const index = {};
    const uniqueStringsAndSymbols = [];

    function visit(item) {
      if (Array.isArray(item)) {
        item.forEach(visit);
      } else if (
        !Object.prototype.hasOwnProperty.call(index, item) &&
        (!filterFn || filterFn(item))
      ) {
        index[item] = true;
        uniqueStringsAndSymbols.push(item);
      }
    }

    for (let i = filterFn ? 1 : 0; i < args.length; i += 1) {
      visit(args[i]);
    }
    return uniqueStringsAndSymbols;
  },

  uniqueNonNumericalStringsAndSymbols(...args) {
    // ...
    return utils.uniqueStringsAndSymbols(
      stringOrSymbol =>
        typeof stringOrSymbol === 'symbol' ||
        !utils.numericalRegExp.test(stringOrSymbol),
      Array.prototype.slice.call(args)
    );
  },

  forwardFlags(testDescriptionString, flags) {
    return testDescriptionString
      .replace(/\[(!?)([^\]]+)\] ?/g, (match, negate, flag) =>
        Boolean(flags[flag]) !== Boolean(negate) ? `${flag} ` : ''
      )
      .trim();
  },

  numericalRegExp: /^(?:0|[1-9][0-9]*)$/,

  packArrows(changes) {
    const moveSourceAndTargetByActualIndex = {};
    changes.forEach((diffItem, index) => {
      if (diffItem.type === 'moveSource') {
        diffItem.changeIndex = index;
        (moveSourceAndTargetByActualIndex[diffItem.actualIndex] =
          moveSourceAndTargetByActualIndex[diffItem.actualIndex] ||
          {}).source = diffItem;
      } else if (diffItem.type === 'moveTarget') {
        diffItem.changeIndex = index;
        (moveSourceAndTargetByActualIndex[diffItem.actualIndex] =
          moveSourceAndTargetByActualIndex[diffItem.actualIndex] ||
          {}).target = diffItem;
      }
    });
    const moveIndices = Object.keys(moveSourceAndTargetByActualIndex);
    if (moveIndices.length > 0) {
      const arrowSpecs = [];
      moveIndices
        .sort(
          (
            a,
            b // Order by distance between change indices descending
          ) =>
            Math.abs(
              moveSourceAndTargetByActualIndex[b].source.changeIndex -
                moveSourceAndTargetByActualIndex[b].target.changeIndex
            ) -
            Math.abs(
              moveSourceAndTargetByActualIndex[a].source.changeIndex -
                moveSourceAndTargetByActualIndex[a].target.changeIndex
            )
        )
        .forEach((actualIndex, i, keys) => {
          const moveSourceAndMoveTarget =
            moveSourceAndTargetByActualIndex[actualIndex];
          const firstChangeIndex = Math.min(
            moveSourceAndMoveTarget.source.changeIndex,
            moveSourceAndMoveTarget.target.changeIndex
          );
          const lastChangeIndex = Math.max(
            moveSourceAndMoveTarget.source.changeIndex,
            moveSourceAndMoveTarget.target.changeIndex
          );

          arrowSpecs.push({
            start: firstChangeIndex,
            end: lastChangeIndex,
            direction:
              moveSourceAndMoveTarget.source.changeIndex <
              moveSourceAndMoveTarget.target.changeIndex
                ? 'down'
                : 'up'
          });
        });

      const packing = greedyIntervalPacker(arrowSpecs);
      while (packing.length > 3) {
        // The arrow packing takes up too many lanes. Turn the moveSource/moveTarget items into inserts and removes
        packing.shift().forEach(({ direction, start, end }) => {
          changes[direction === 'up' ? start : end].type = 'insert';
          changes[direction === 'up' ? end : start].type = 'remove';
        });
      }
      return packing;
    }
  },

  truncateSubjectStringForBegin(subject, value) {
    var contextLength = value.length + 25;
    if (subject.length <= contextLength) {
      return null;
    }
    var truncationIndex = subject.indexOf(' ', value.length + 1);
    if (truncationIndex > -1 && truncationIndex < contextLength) {
      return subject.substring(0, truncationIndex);
    } else {
      return subject.substring(0, contextLength);
    }
  },

  truncateSubjectStringForEnd(subject, value) {
    var contextLength = subject.length - value.length - 25;
    if (contextLength <= 0) {
      return null;
    }
    var truncationIndex = subject.lastIndexOf(' ', value.length + 1);
    if (truncationIndex > -1 && truncationIndex >= contextLength) {
      return subject.substring(truncationIndex + 1, subject.length);
    } else {
      return subject.substring(contextLength, subject.length);
    }
  }
});
