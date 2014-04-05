/*global namespace*/
(function () {
    var shim = namespace.shim;
    var forEach = shim.forEach;
    var getKeys = shim.getKeys;

    var utils = {
        // https://gist.github.com/1044128/
        getOuterHTML: function (element) {
            // jshint browser:true
            if ('outerHTML' in element) return element.outerHTML;
            var ns = "http://www.w3.org/1999/xhtml";
            var container = document.createElementNS(ns, '_');
            var xmlSerializer = new XMLSerializer();
            var html;
            if (document.xmlVersion) {
                return xmlSerializer.serializeToString(element);
            } else {
                container.appendChild(element.cloneNode(false));
                html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');
                container.innerHTML = '';
                return html;
            }
        },

        // Returns true if object is a DOM element.
        isDOMElement: function (object) {
            if (typeof HTMLElement === 'object') {
                return object instanceof HTMLElement;
            } else {
                return object &&
                    typeof object === 'object' &&
                    object.nodeType === 1 &&
                    typeof object.nodeName === 'string';
            }
        },


        isArray: function (ar) {
            return Object.prototype.toString.call(ar) === '[object Array]';
        },

        isRegExp: function (re) {
            var s;
            try {
                s = '' + re;
            } catch (e) {
                return false;
            }

            return re instanceof RegExp || // easy case
            // duck-type for context-switching evalcx case
            typeof(re) === 'function' &&
                re.constructor.name === 'RegExp' &&
                re.compile &&
                re.test &&
                re.exec &&
                s.match(/^\/.*\/[gim]{0,3}$/);
        },

        isError: function (err) {
            return typeof err === 'object' && Object.prototype.toString.call(err) === '[object Error]';
        },

        isDate: function (d) {
            if (d instanceof Date) return true;
            return false;
        },

        extend: function (target) {
            var sources = Array.prototype.slice.call(arguments, 1);
            forEach(sources, function (source) {
                forEach(getKeys(source), function (key) {
                    target[key] = source[key];
                });
            });
            return target;
        },

        isUndefinedOrNull: function  (value) {
            return value === null || value === undefined;
        },

        isArguments: function  (object) {
            return Object.prototype.toString.call(object) === '[object Arguments]';
        },

        /**
         * Levenshtein distance algorithm from wikipedia
         * http://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance#JavaScript
         */
        levenshteinDistance: function (a, b) {
            if (a.length === 0) return b.length;
            if (b.length === 0) return a.length;

            var matrix = [];

            // increment along the first column of each row
            var i;
            for (i = 0; i <= b.length; i += 1) {
                matrix[i] = [i];
            }

            // increment each column in the first row
            var j;
            for (j = 0; j <= a.length; j += 1) {
                matrix[0][j] = j;
            }

            // Fill in the rest of the matrix
            for (i = 1; i <= b.length; i += 1) {
                for (j = 1; j <= a.length; j += 1) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                                                Math.min(matrix[i][j - 1] + 1, // insertion
                                                         matrix[i - 1][j] + 1)); // deletion
                    }
                }
            }

            return matrix[b.length][a.length];
        },

        truncateStack: function (err, fn) {
            if (Error.captureStackTrace) {
                Error.captureStackTrace(err, fn);
            } else if ('stack' in err) {
                // Excludes IE<10, and fn cannot be anonymous for this backup plan to work:
                var stackEntries = err.stack.split(/\r\n?|\n\r?/),
                needle = 'at ' + fn.name + ' ';
                for (var i = 0 ; i < stackEntries.length ; i += 1) {
                    if (stackEntries[i].indexOf(needle) !== -1) {
                        stackEntries.splice(1, i);
                        err.stack = stackEntries.join("\n");
                    }
                }
            }
        },

        findFirst: function (arr, predicate, thisObj) {
            var scope = thisObj || null;
            for (var i = 0 ; i < arr.length ; i += 1) {
                if (predicate.call(scope, arr[i], i, arr)) {
                    return arr[i];
                }
            }
            return null;
        }
    };

    namespace.utils = utils;
}());
