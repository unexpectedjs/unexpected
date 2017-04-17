/* eslint-disable no-proto */
var canSetPrototype = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array);
var greedyIntervalPacker = require('greedy-interval-packer');

var setPrototypeOf = Object.setPrototypeOf || function setPrototypeOf(obj, proto) {
    obj.__proto__ = proto;
    return obj;
};
/* eslint-enable no-proto */

var utils = module.exports = {
    objectIs: Object.is || function (a, b) {
        // Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
        if (a === 0 && b === 0) {
            return 1 / a === 1 / b;
        }
        if (a !== a) {
            return b !== b;
        }
        return a === b;
    },

    isArray: function (ar) {
        return Object.prototype.toString.call(ar) === '[object Array]';
    },

    isRegExp: function (re) {
        return (Object.prototype.toString.call(re) === '[object RegExp]');
    },

    isError: function (err) {
        return typeof err === 'object' && (Object.prototype.toString.call(err) === '[object Error]' || err instanceof Error);
    },

    extend: function (target) {
        for (var i = 1; i < arguments.length; i += 1) {
            var source = arguments[i];
            if (source) {
                Object.keys(source).forEach(function (key) {
                    target[key] = source[key];
                });
            }
        }
        return target;
    },

    findFirst: function (arr, predicate) {
        for (var i = 0 ; i < arr.length ; i += 1) {
            if (predicate(arr[i])) {
                return arr[i];
            }
        }
        return null;
    },

    leftPad: function (str, width, ch) {
        ch = ch || ' ';
        while (str.length < width) {
            str = ch + str;
        }
        return str;
    },

    escapeRegExpMetaChars: function (str) {
        return str.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
    },

    escapeChar: function (ch) {
        if (ch === '\t') {
            return '\\t';
        } else if (ch === '\r') {
            return '\\r';
        } else {
            var charCode = ch.charCodeAt(0);
            var hexChars = charCode.toString(16).toUpperCase();
            if (charCode < 256) {
                return '\\x' + utils.leftPad(hexChars, 2, '0');
            } else {
                return '\\u' + utils.leftPad(hexChars, 4, '0');
            }
        }
    },

    getFunctionName: function (f) {
        if (typeof f.name === 'string') {
            return f.name;
        }
        var matchFunctionName = Function.prototype.toString.call(f).match(/function ([^\(]+)/);
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

    wrapConstructorNameAroundOutput: function (output, obj) {
        var constructor = obj.constructor;
        var constructorName = constructor && constructor !== Object && utils.getFunctionName(constructor);
        if (constructorName && constructorName !== 'Object') {
            return output.clone().text(constructorName + '(').append(output).text(')');
        } else {
            return output;
        }
    },

    setPrototypeOfOrExtend: canSetPrototype ? setPrototypeOf : function extend(target, source) {
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                target[prop] = source[prop];
            }
        }
        return target;
    },

    uniqueStringsAndSymbols: function () { // [filterFn], item1, item2...
        var filterFn;
        if (typeof arguments[0] === 'function') {
            filterFn = arguments[0];
        }
        var index = {};
        var uniqueStringsAndSymbols = [];

        function visit(item) {
            if (Array.isArray(item)) {
                item.forEach(visit);
            } else if (!Object.prototype.hasOwnProperty.call(index, item) && (!filterFn || filterFn(item))) {
                index[item] = true;
                uniqueStringsAndSymbols.push(item);
            }
        }

        for (var i = filterFn ? 1 : 0 ; i < arguments.length ; i += 1) {
            visit(arguments[i]);
        }
        return uniqueStringsAndSymbols;
    },

    uniqueNonNumericalStringsAndSymbols: function () { // ...
        return utils.uniqueStringsAndSymbols(function (stringOrSymbol) {
            return typeof stringOrSymbol === 'symbol' || !utils.numericalRegExp.test(stringOrSymbol);
        }, Array.prototype.slice.call(arguments));
    },

    forwardFlags: function (testDescriptionString, flags) {
        return testDescriptionString.replace(/\[(!?)([^\]]+)\] ?/g, function (match, negate, flag) {
            return Boolean(flags[flag]) !== Boolean(negate) ? flag + ' ' : '';
        }).trim();
    },

    numericalRegExp: /^(?:0|[1-9][0-9]*)$/,

    packArrows: function (changes) {
        var moveSourceAndTargetByActualIndex = {};
        changes.forEach(function (diffItem, index) {
            if (diffItem.type === 'moveSource') {
                diffItem.changeIndex = index;
                (moveSourceAndTargetByActualIndex[diffItem.actualIndex] = moveSourceAndTargetByActualIndex[diffItem.actualIndex] || {}).source = diffItem;
            } else if (diffItem.type === 'moveTarget') {
                diffItem.changeIndex = index;
                (moveSourceAndTargetByActualIndex[diffItem.actualIndex] = moveSourceAndTargetByActualIndex[diffItem.actualIndex] || {}).target = diffItem;
            }
        });
        var moveIndices = Object.keys(moveSourceAndTargetByActualIndex);
        if (moveIndices.length > 0) {
            var arrowSpecs = [];
            moveIndices.sort(function (a, b) {
                // Order by distance between change indices descending
                return Math.abs(moveSourceAndTargetByActualIndex[b].source.changeIndex - moveSourceAndTargetByActualIndex[b].target.changeIndex) - Math.abs(moveSourceAndTargetByActualIndex[a].source.changeIndex - moveSourceAndTargetByActualIndex[a].target.changeIndex);
            }).forEach(function (actualIndex, i, keys) {
                var moveSourceAndMoveTarget = moveSourceAndTargetByActualIndex[actualIndex];
                var firstChangeIndex = Math.min(moveSourceAndMoveTarget.source.changeIndex, moveSourceAndMoveTarget.target.changeIndex);
                var lastChangeIndex = Math.max(moveSourceAndMoveTarget.source.changeIndex, moveSourceAndMoveTarget.target.changeIndex);

                arrowSpecs.push({
                    start: firstChangeIndex,
                    end: lastChangeIndex,
                    direction: moveSourceAndMoveTarget.source.changeIndex < moveSourceAndMoveTarget.target.changeIndex ? 'down' : 'up'
                });
            });

            var packing = greedyIntervalPacker(arrowSpecs);
            while (packing.length > 3) {
                // The arrow packing takes up too many lanes. Turn the moveSource/moveTarget items into inserts and removes
                packing.shift().forEach(function (entry) {
                    changes[entry.direction === 'up' ? entry.start : entry.end].type = 'insert';
                    changes[entry.direction === 'up' ? entry.end : entry.start].type = 'remove';
                });
            }
            return packing;
        }
    }
};
