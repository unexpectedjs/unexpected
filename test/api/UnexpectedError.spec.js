/*global expect*/
describe('UnexpectedError', function () {
    describe('with a single line message', function () {
        it('should be inspected correctly', function () {
            expect(function () {
                expect(2, 'to equal', 4);
            }, 'to throw', function (err) {
                expect(err, 'to inspect as', 'UnexpectedError(expected 2 to equal 4)');
            });
        });
    });

    describe('with a multiline message', function () {
        it('should be inspected correctly', function () {
            expect(function () {
                expect('foo', 'to equal', 'bar');
            }, 'to throw', function (err) {
                expect(
                    err,
                    'to inspect as',
                    "UnexpectedError(\n" +
                        "  expected 'foo' to equal 'bar'\n" +
                        "\n" +
                        "  -foo\n" +
                        "  +bar\n" +
                        ")"
                );
            });
        });
    });

    it('#getKeys should return a trimmed-down list', function () {
        expect(function () {
            expect('foo', 'to equal', 'bar');
        }, 'to throw', function (err) {
            expect(expect.findTypeOf(err).getKeys(err), 'to equal', [ 'message', 'errorMode', 'parent' ]);
        });
    });

    describe('when full stack traces is disabled', function () {
        it('trims the stack for node_module/unexpected/ and node_module/unexpected-<plugin-name>/', function () {
            expect(function () {
                expect.fail('wat');
            }, 'to throw', function (err) {
                err.useFullStackTrace = false;
                err._hasSerializedErrorMessage = false;
                err.stack =
                    'UnexpectedError:\n' +
                    'wat\n' +
                    '      at oathbreaker (node_modules/unexpected/lib/oathbreaker.js:46:19)\n' +
                    '      at Function.Unexpected.withError (node_modules/unexpected-sinon/lib/unexpected-sinon.js:123:1)\n' +
                    '      at Function.Unexpected.withError (node_modules/unexpected/lib/Unexpected.js:792:12)\n' +
                    '      at Function.<anonymous> (node_modules/unexpected/lib/assertions.js:569:16)\n' +
                    '      at executeExpect (node_modules/unexpected/lib/Unexpected.js:1103:50)\n' +
                    '      at Unexpected.expect (node_modules/unexpected/lib/Unexpected.js:1111:22)\n' +
                    '      at Context.<anonymous> (test/Insection.spec.js:48:17)';

                err.serializeMessage('text');

                expect(err, 'to satisfy', {
                    stack: 'UnexpectedError:\n' +
                        'wat\n' +
                        '      at Context.<anonymous> (test/Insection.spec.js:48:17)\n' +
                        '      set UNEXPECTED_FULL_TRACE=true to see the full stack trace'
                });
            });
        });

        describe('and the output format is set to html', function () {
            it('shows a helping message about how to turn of stack trace trimming', function () {
                expect(function () {
                    expect.fail('wat');
                }, 'to throw', function (err) {
                    err.useFullStackTrace = false;
                    err._hasSerializedErrorMessage = false;
                    err.stack =
                        'UnexpectedError:\n' +
                        'wat\n' +
                        '      at oathbreaker (node_modules/unexpected/lib/oathbreaker.js:46:19)\n' +
                        '      at Function.Unexpected.withError (node_modules/unexpected-sinon/lib/unexpected-sinon.js:123:1)\n' +
                        '      at Function.Unexpected.withError (node_modules/unexpected/lib/Unexpected.js:792:12)\n' +
                        '      at Function.<anonymous> (node_modules/unexpected/lib/assertions.js:569:16)\n' +
                        '      at executeExpect (node_modules/unexpected/lib/Unexpected.js:1103:50)\n' +
                        '      at Unexpected.expect (node_modules/unexpected/lib/Unexpected.js:1111:22)\n' +
                        '      at Context.<anonymous> (test/Insection.spec.js:48:17)';

                    err.serializeMessage('html');

                    expect(err, 'to satisfy', {
                        stack: 'UnexpectedError:\n' +
                            'wat\n' +
                            '      at Context.<anonymous> (test/Insection.spec.js:48:17)\n' +
                            '      set the query parameter full-trace=true to see the full stack trace'
                    });
                });
            });
        });
    });

    describe('when full stack traces is enabled', function () {
        it('the initial stack is preserved', function () {
            expect(function () {
                expect.fail('wat');
            }, 'to throw', function (err) {
                err.useFullStackTrace = true;
                err._hasSerializedErrorMessage = false;
                err.stack =
                    'UnexpectedError:\n' +
                    'wat\n' +
                    '      at oathbreaker (node_modules/unexpected/lib/oathbreaker.js:46:19)\n' +
                    '      at Function.Unexpected.withError (node_modules/unexpected-sinon/lib/unexpected-sinon.js:123:1)\n' +
                    '      at Function.Unexpected.withError (node_modules/unexpected/lib/Unexpected.js:792:12)\n' +
                    '      at Function.<anonymous> (node_modules/unexpected/lib/assertions.js:569:16)\n' +
                    '      at executeExpect (node_modules/unexpected/lib/Unexpected.js:1103:50)\n' +
                    '      at Unexpected.expect (node_modules/unexpected/lib/Unexpected.js:1111:22)\n' +
                    '      at Context.<anonymous> (test/Insection.spec.js:48:17)';

                err.serializeMessage('text');

                expect(err, 'to satisfy', {
                    stack: 'UnexpectedError:\n' +
                        'wat\n' +
                        '      at oathbreaker (node_modules/unexpected/lib/oathbreaker.js:46:19)\n' +
                        '      at Function.Unexpected.withError (node_modules/unexpected-sinon/lib/unexpected-sinon.js:123:1)\n' +
                        '      at Function.Unexpected.withError (node_modules/unexpected/lib/Unexpected.js:792:12)\n' +
                        '      at Function.<anonymous> (node_modules/unexpected/lib/assertions.js:569:16)\n' +
                        '      at executeExpect (node_modules/unexpected/lib/Unexpected.js:1103:50)\n' +
                        '      at Unexpected.expect (node_modules/unexpected/lib/Unexpected.js:1111:22)\n' +
                        '      at Context.<anonymous> (test/Insection.spec.js:48:17)'
                });
            });
        });
    });
});
