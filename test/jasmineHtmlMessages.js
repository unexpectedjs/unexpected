/*global jasmineRequire*/
(function () {
    if (typeof jasmineRequire === 'object') {
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
}());
