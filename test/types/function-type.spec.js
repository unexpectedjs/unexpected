/*global expect*/
describe('function type', function () {
    it('should inspect an empty function correctly', function () {
        expect(function () {}, 'to inspect as',
               'function () {}'
              );
    });

    it('should inspect an function with just a newline correctly', function () {
        expect(function () {
        }, 'to inspect as',
               'function () {}'
              );
    });

    it('should inspect a one-line function correctly', function () {
        expect(function () {
            var a = 123; a = 456;
        }, 'to inspect as', 'function () { var a = 123; a = 456; }');
    });

    it('should inspect a short one-line function with leading and trailing newline correctly', function () {
        expect(function () {
            var a = 123; a = 456;
        }, 'to inspect as',
               'function () { var a = 123; a = 456; }'
              );
    });

    it('should inspect a long one-line function with leading and trailing newline correctly', function () {
        expect(function () {
            var a = 123 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2; a = 456;
        }, 'to inspect as',
               'function () {\n' +
               '  var a = 123 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2; a = 456;\n' +
               '}'
              );
    });

    function singleLineWithComment() {
        var a = 123; a = 456; // foo
    }

    var phantomJsBug = singleLineWithComment.toString().indexOf('// foo;') !== -1;

    if (!phantomJsBug) {
        it('should inspect a short one-line function with leading and trailing newline correctly and a C++-style comment correctly', function () {
            expect(function () {
                var a = 123; a = 456; // foo
            }, 'to inspect as',
                   'function () {\n' +
                   '  var a = 123; a = 456; // foo\n' +
                   '}'
                  );
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
});
