/*global expect*/
describe('function type', function () {
    it('should inspect an empty anonymous function correctly', function () {
        expect(
            function () {},
            'to inspect as',
            'function () {}'
        );
    });

    it('should inspect an empty named function correctly', function () {
        expect(
            function foo() {},
            'to inspect as',
            'function foo() {}'
        );
    });

    it('should inspect an anonymous bound function correctly', function () {
        expect(
            function () {}.bind({}),
            'to inspect as',
            'function bound () { /* native code */ }'
         );
    });

    it('should inspect a named bound function correctly', function () {
        expect(
            function foo() {}.bind({}),
            'to inspect as',
            'function bound foo() { /* native code */ }'
        );
    });

    it('should inspect an function with just a newline correctly', function () {
        expect(function () {}, 'to inspect as', 'function () {}');
    });

    it('should inspect a one-line function correctly', function () {
        /* eslint-disable no-unused-vars */
        expect(function () {
            var a = 123; a = 456;
        }, 'to inspect as', 'function () { var a = 123; a = 456; }');
        /* eslint-enable no-unused-vars */
    });

    it('should inspect a short one-line function with leading and trailing newline correctly', function () {
        /* eslint-disable no-unused-vars */
        expect(function () {
            var a = 123; a = 456;
        }, 'to inspect as',
               'function () { var a = 123; a = 456; }'
              );
        /* eslint-enable no-unused-vars */
    });

    it('should inspect a long one-line function with leading and trailing newline correctly', function () {
        /* eslint-disable no-unused-vars */
        expect(function () {
            var a = 123 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2; a = 456;
        }, 'to inspect as',
               'function () {\n' +
               '  var a = 123 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2; a = 456;\n' +
               '}'
              );
      /* eslint-enable no-unused-vars */
    });

    /* eslint-disable no-unused-vars */
    function singleLineWithComment() {
        var a = 123; a = 456; // foo
    }
    /* eslint-enable no-unused-vars */

    var phantomJsBug = singleLineWithComment.toString().indexOf('// foo;') !== -1;

    if (!phantomJsBug) {
        it('should inspect a short one-line function with leading and trailing newline correctly and a C++-style comment correctly', function () {
            /* eslint-disable no-unused-vars */
            expect(function () {
                var a = 123; a = 456; // foo
            }, 'to inspect as',
                   'function () {\n' +
                   '  var a = 123; a = 456; // foo\n' +
                   '}'
                  );
            /* eslint-enable no-unused-vars */
        });
    }

    it('should reindent a function with an indentation size of 4', function () {
        expect(function () {
            var a = 4;
            if (a === 1) {
                a();
            }
        }, 'to inspect as',
               'function () {\n' +
               '  var a = 4;\n' +
               '  if (a === 1) {\n' +
               '    a();\n' +
               '  }\n' +
               '}'
              );
    });

    it('should reindent a function with an indentation size of 3', function () {
        // jscs:disable
        expect(function () {
            var a = 4;
            if (a === 1) {
                a();
            }
        }, 'to inspect as',
               'function () {\n' +
               '  var a = 4;\n' +
               '  if (a === 1) {\n' +
               '    a();\n' +
               '  }\n' +
               '}');
        // jscs:enable
    });

    it('should reindent a function with an indentation size of 1', function () {
        // jscs:disable
        expect(function () {
            var a = 4;
            if (a === 1) {
                a();
            }
        }, 'to inspect as',
               'function () {\n' +
               '  var a = 4;\n' +
               '  if (a === 1) {\n' +
               '    a();\n' +
               '  }\n' +
               '}');
        // jscs:enable
    });

    // We can't complete this test if the runtime doesn't support arrow functions:
    var singleParamArrowFunction;
    try {
        singleParamArrowFunction = new Function('return a => a + 1;')();
    } catch (e) {}

    if (singleParamArrowFunction) {
        it('should render a single param arrow function', function () {
            expect(singleParamArrowFunction, 'to inspect as', 'a => a + 1');
        });
    }

    // We can't complete this test if the runtime doesn't support arrow functions:
    var multiParamArrowFunction;
    try {
        multiParamArrowFunction = new Function('return (a, b) => a + b;')();
    } catch (e) {}

    if (multiParamArrowFunction) {
        it('should render a multi param arrow function', function () {
            expect(multiParamArrowFunction, 'to inspect as', '(a, b) => a + b');
        });
    }

    // We can't complete this test if the runtime doesn't support the async keyword:
    var asyncFunction;
    try {
        asyncFunction = new Function('return async function foo(a) {return a + 1;}')();
    } catch (e) {}

    if (asyncFunction) {
        it('should render "async" before an AsyncFunction instance', function () {
            expect(asyncFunction, 'to inspect as', 'async function foo(a) { return a + 1; }');
        });
    }
});
