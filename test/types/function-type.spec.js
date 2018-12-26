/*global expect*/
describe('function type', () => {
  it('should inspect an empty anonymous function correctly', () => {
    expect(function() {}, 'to inspect as', 'function () {}');
  });

  it('should inspect an empty named function correctly', () => {
    expect(function foo() {}, 'to inspect as', 'function foo() {}');
  });

  it('should inspect a function with a custom toString correctly', () => {
    var fn = function foo() {};
    fn.toString = 'breakage';
    expect(fn, 'to inspect as', 'function foo() {}');
  });

  var isNodeJs3OrBelow =
    typeof process === 'object' && /^v[0123]\./.test(process.version);

  var isIE =
    typeof navigator !== 'undefined' &&
    navigator.userAgent.indexOf('Trident') !== -1;

  if (!isNodeJs3OrBelow && !isIE) {
    // Node.js 3 and below and IE11 don't include "bound ".
    // For now let's just disable these tests in those environments

    it('should inspect an anonymous bound function correctly', () => {
      expect(
        // eslint-disable-next-line no-extra-bind
        function() {}.bind({}),
        'to inspect as',
        'function bound () { /* native code */ }'
      );
    });

    it('should inspect a named bound function correctly', () => {
      expect(
        // eslint-disable-next-line no-extra-bind
        function foo() {}.bind({}),
        'to inspect as',
        'function bound foo() { /* native code */ }'
      );
    });
  }

  it('should inspect an function with just a newline correctly', () => {
    expect(function() {}, 'to inspect as', 'function () {}');
  });

  it('should inspect a one-line function correctly', () => {
    /* eslint-disable no-unused-vars */
    expect(
      // prettier-ignore
      function() { var a = 123;a = 456; },
      'to inspect as',
      'function () { var a = 123;a = 456; }'
    );
    /* eslint-enable no-unused-vars */
  });

  it('should inspect a short one-line function with leading and trailing newline correctly', () => {
    /* eslint-disable no-unused-vars */
    expect(
      // prettier-ignore
      function() { var a = 123;a = 456; },
      'to inspect as',
      'function () { var a = 123;a = 456; }'
    );
    /* eslint-enable no-unused-vars */
  });

  it('should inspect a long one-line function with leading and trailing newline correctly', () => {
    /* eslint-disable no-unused-vars */
    expect(
      // prettier-ignore
      function() {
        var a = 123 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2;a = 456;
      },
      'to inspect as',
      'function () {\n' +
        '  var a = 123 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2;a = 456;\n' +
        '}'
    );
    /* eslint-enable no-unused-vars */
  });

  /* eslint-disable no-unused-vars */
  function singleLineWithComment() {
    var a = 123;
    a = 456; // foo
  }
  /* eslint-enable no-unused-vars */

  it('should inspect a short one-line function with leading and trailing newline correctly and a C++-style comment correctly', () => {
    /* eslint-disable no-unused-vars */
    expect(
      // prettier-ignore
      function() {
          var a = 123;a = 456; // foo
        },
      'to inspect as',
      'function () {\n' + '  var a = 123;a = 456; // foo\n' + '}'
    );
    /* eslint-enable no-unused-vars */
  });

  it('should reindent a function with an indentation size of 4', () => {
    expect(
      function() {
        var a = 4;
        if (a === 1) {
          a();
        }
      },
      'to inspect as',
      'function () {\n' +
        '  var a = 4;\n' +
        '  if (a === 1) {\n' +
        '    a();\n' +
        '  }\n' +
        '}'
    );
  });

  it('should reindent a function with an indentation size of 3', () => {
    // jscs:disable
    expect(
      function() {
        var a = 4;
        if (a === 1) {
          a();
        }
      },
      'to inspect as',
      'function () {\n' +
        '  var a = 4;\n' +
        '  if (a === 1) {\n' +
        '    a();\n' +
        '  }\n' +
        '}'
    );
    // jscs:enable
  });

  it('should reindent a function with an indentation size of 1', () => {
    // jscs:disable
    expect(
      function() {
        var a = 4;
        if (a === 1) {
          a();
        }
      },
      'to inspect as',
      'function () {\n' +
        '  var a = 4;\n' +
        '  if (a === 1) {\n' +
        '    a();\n' +
        '  }\n' +
        '}'
    );
    // jscs:enable
  });

  // We can't complete this test if the runtime doesn't support arrow functions:
  var singleParamArrowFunction;
  try {
    // eslint-disable-next-line no-new-func
    singleParamArrowFunction = new Function('return a => a + 1;')();
  } catch (e) {}

  if (singleParamArrowFunction) {
    it('should render a single param arrow function', () => {
      expect(singleParamArrowFunction, 'to inspect as', 'a => a + 1');
    });
  }

  // We can't complete this test if the runtime doesn't support arrow functions:
  var implicitReturnMultilineArrowFunction;
  try {
    // eslint-disable-next-line no-new-func
    implicitReturnMultilineArrowFunction = new Function(
      'return a => \n    a + 1;'
    )();
  } catch (e) {}

  if (implicitReturnMultilineArrowFunction) {
    it('should render an implicit return multiline arrow function', () => {
      expect(
        implicitReturnMultilineArrowFunction,
        'to inspect as',
        'a => \n    a + 1'
      );
    });
  }

  // We can't complete this test if the runtime doesn't support arrow functions:
  var evilImplicitReturnMultilineArrowFunction;
  try {
    // eslint-disable-next-line no-new-func
    evilImplicitReturnMultilineArrowFunction = new Function(
      'return a => \n    a || {};'
    )();
  } catch (e) {}

  if (evilImplicitReturnMultilineArrowFunction) {
    it('should render an implicit return multiline arrow function with an evil alternation', () => {
      expect(
        evilImplicitReturnMultilineArrowFunction,
        'to inspect as',
        'a => \n    a || {}'
      );
    });
  }

  // We can't complete this test if the runtime doesn't support arrow functions:
  var arrowFunctionWith1SpaceIndentAndLeadingNewline;
  try {
    // eslint-disable-next-line no-new-func
    arrowFunctionWith1SpaceIndentAndLeadingNewline = new Function(
      'return () =>\n foo(\n  1\n )'
    )();
  } catch (e) {}

  if (arrowFunctionWith1SpaceIndentAndLeadingNewline) {
    it('should reindent an implicit return multiline arrow function with 1 space indent', () => {
      expect(
        arrowFunctionWith1SpaceIndentAndLeadingNewline,
        'to inspect as',
        '() =>\n  foo(\n    1\n  )'
      );
    });
  }

  // We can't complete this test if the runtime doesn't support arrow functions:
  var arrowFunctionWith2SpaceIndentAndLeadingNewline;
  try {
    // eslint-disable-next-line no-new-func
    arrowFunctionWith2SpaceIndentAndLeadingNewline = new Function(
      'return () =>\n        foo(\n          1\n        )'
    )();
  } catch (e) {}

  if (arrowFunctionWith2SpaceIndentAndLeadingNewline) {
    it('should reindent an implicit return multiline arrow function with 2 space indent', () => {
      expect(
        arrowFunctionWith2SpaceIndentAndLeadingNewline,
        'to inspect as',
        '() =>\n  foo(\n    1\n  )'
      );
    });
  }

  // We can't complete this test if the runtime doesn't support arrow functions:
  var arrowFunctionWith3SpaceIndentAndLeadingNewline;
  try {
    // eslint-disable-next-line no-new-func
    arrowFunctionWith3SpaceIndentAndLeadingNewline = new Function(
      'return () =>\n      foo(\n         1\n      )'
    )();
  } catch (e) {}

  if (arrowFunctionWith3SpaceIndentAndLeadingNewline) {
    it('should reindent an implicit return multiline arrow function with 4 space indent', () => {
      expect(
        arrowFunctionWith3SpaceIndentAndLeadingNewline,
        'to inspect as',
        '() =>\n  foo(\n    1\n  )'
      );
    });
  }

  // We can't complete this test if the runtime doesn't support arrow functions:
  var arrowFunctionWith4SpaceIndentAndLeadingNewline;
  try {
    // eslint-disable-next-line no-new-func
    arrowFunctionWith4SpaceIndentAndLeadingNewline = new Function(
      'return () =>\n        foo(\n            1\n        )'
    )();
  } catch (e) {}

  if (arrowFunctionWith4SpaceIndentAndLeadingNewline) {
    it('should reindent an implicit return multiline arrow function with long leading indent', () => {
      expect(
        arrowFunctionWith4SpaceIndentAndLeadingNewline,
        'to inspect as',
        '() =>\n  foo(\n    1\n  )'
      );
    });
  }

  // We can't complete this test if the runtime doesn't support arrow functions:
  var multiParamArrowFunction;
  try {
    // eslint-disable-next-line no-new-func
    multiParamArrowFunction = new Function('return (a, b) => a + b;')();
  } catch (e) {}

  if (multiParamArrowFunction) {
    it('should render a multi param arrow function', () => {
      expect(multiParamArrowFunction, 'to inspect as', '(a, b) => a + b');
    });
  }

  // We can't complete this test if the runtime doesn't support the async keyword:
  var asyncFunction;
  try {
    // eslint-disable-next-line no-new-func
    asyncFunction = new Function(
      'return async function foo(a) {return a + 1;}'
    )();
  } catch (e) {}

  if (asyncFunction) {
    it('should render "async" before an AsyncFunction instance', () => {
      expect(
        asyncFunction,
        'to inspect as',
        'async function foo(a) { return a + 1; }'
      );
    });
  }
});
