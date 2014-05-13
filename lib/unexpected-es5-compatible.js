/*global namespace*/
(function () {
    namespace.shim = namespace.shim || {};
    var shim = namespace.shim;

    var prototypes = {
        bind: Function.prototype.bind,
        every: Array.prototype.every,
        some: Array.prototype.some,
        indexOf: Array.prototype.indexOf,
        forEach: Array.prototype.forEach,
        map: Array.prototype.map,
        filter: Array.prototype.filter,
        reduce: Array.prototype.reduce,
        trim: String.prototype.trim
    };

    function createShimMethod(key) {
        shim[key] = function (obj) {
            var args = Array.prototype.slice.call(arguments, 1);
            return prototypes[key].apply(obj, args);
        };
    }

    for (var key in prototypes) {
        if (prototypes.hasOwnProperty(key) && prototypes[key]) {
            createShimMethod(key);
        }
    }

    if (!shim.bind) {
        shim.bind = function (fn, scope) {
            return function () {
                return fn.apply(scope, arguments);
            };
        };
    }

    if (Object.keys) {
        shim['getKeys'] = Object.keys;
    }

    if ('object' === typeof JSON && JSON.parse && JSON.stringify) {
        shim['JSON'] = JSON;
    }
}());
