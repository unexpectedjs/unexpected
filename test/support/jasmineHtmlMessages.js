/* global jasmineRequire */
(function () {
  if (typeof jasmineRequire === 'object') {
    const originalBuildExpectationResult = jasmineRequire.buildExpectationResult();
    jasmineRequire.buildExpectationResult = function () {
      return function (options) {
        const result = originalBuildExpectationResult.apply(this, arguments);
        if (options.error && options.error.htmlMessage) {
          const errorElement = document.createElement('div');
          errorElement.innerHTML = options.error.htmlMessage;
          result.stack = result.stack.substring(result.message.length);
          result.message = errorElement;
        }
        return result;
      };
    };
  }
})();
