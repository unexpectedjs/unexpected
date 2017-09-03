var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*global jasmineRequire*/
(function () {
    if ((typeof jasmineRequire === 'undefined' ? 'undefined' : _typeof(jasmineRequire)) === 'object') {
        var originalBuildExpectationResult = jasmineRequire.buildExpectationResult();
        jasmineRequire.buildExpectationResult = function () {
            return function (options) {
                var result = originalBuildExpectationResult.apply(this, arguments);
                if (options.error && options.error.htmlMessage) {
                    var errorElement = document.createElement('div');
                    errorElement.innerHTML = options.error.htmlMessage;
                    result.stack = result.stack.substring(result.message.length);
                    result.message = errorElement;
                }
                return result;
            };
        };
    }
})();