/*global expect*/
describe('UnexpectedError', () => {
  describe('with a single line message', () => {
    it('should be inspected correctly', () => {
      expect(
        function() {
          expect(2, 'to equal', 4);
        },
        'to throw',
        expect.it(function(err) {
          expect(
            err,
            'to inspect as',
            'UnexpectedError(expected 2 to equal 4)'
          );
        })
      );
    });
  });

  describe('with a multiline message', () => {
    it('should be inspected correctly', () => {
      expect(
        function() {
          expect('foo', 'to equal', 'bar');
        },
        'to throw',
        expect.it(function(err) {
          expect(
            err,
            'to inspect as',
            'UnexpectedError(\n' +
              "  expected 'foo' to equal 'bar'\n" +
              '\n' +
              '  -foo\n' +
              '  +bar\n' +
              ')'
          );
        })
      );
    });
  });

  it('#getKeys should return a trimmed-down list', () => {
    expect(
      function() {
        expect('foo', 'to equal', 'bar');
      },
      'to throw',
      expect.it(function(err) {
        expect(expect.findTypeOf(err).getKeys(err), 'to equal', [
          'message',
          'errorMode',
          'parent'
        ]);
      })
    );
  });

  describe('when full stack traces is disabled', () => {
    it('trims the stack for node_module/unexpected/ and node_module/unexpected-<plugin-name>/', () => {
      expect(
        function() {
          expect.fail('wat');
        },
        'to throw',
        expect.it(function(err) {
          err.useFullStackTrace = false;
          err._hasSerializedErrorMessage = false;
          err.stack =
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
            stack:
              'wat\n' +
              '      at Context.<anonymous> (test/Insection.spec.js:48:17)\n' +
              '      set UNEXPECTED_FULL_TRACE=true to see the full stack trace'
          });
        })
      );
    });

    it('trims the stack for node_module\\unexpected\\ and node_module\\unexpected-<plugin-name>\\ (windows paths)', () => {
      expect(
        function() {
          expect.fail('wat');
        },
        'to throw',
        expect.it(function(err) {
          err.useFullStackTrace = false;
          err._hasSerializedErrorMessage = false;
          err.stack =
            'wat\n' +
            '      at oathbreaker (node_modules\\unexpected\\lib\\oathbreaker.js:46:19)\n' +
            '      at Function.Unexpected.withError (node_modules\\unexpected-sinon\\lib\\unexpected-sinon.js:123:1)\n' +
            '      at Function.Unexpected.withError (node_modules\\unexpected\\lib\\Unexpected.js:792:12)\n' +
            '      at Function.<anonymous> (node_modules\\unexpected\\lib\\assertions.js:569:16)\n' +
            '      at executeExpect (node_modules\\unexpected\\lib\\Unexpected.js:1103:50)\n' +
            '      at Unexpected.expect (node_modules\\unexpected\\lib\\Unexpected.js:1111:22)\n' +
            '      at Context.<anonymous> (test\\Insection.spec.js:48:17)';

          err.serializeMessage('text');

          expect(err, 'to satisfy', {
            stack:
              'wat\n' +
              '      at Context.<anonymous> (test\\Insection.spec.js:48:17)\n' +
              '      set UNEXPECTED_FULL_TRACE=true to see the full stack trace'
          });
        })
      );
    });

    it('trims the stack for custom assertions in the consuming code', () => {
      expect(
        function() {
          expect.fail('wat');
        },
        'to throw',
        expect.it(function(err) {
          err.useFullStackTrace = false;
          err._hasSerializedErrorMessage = false;
          err.stack =
            'wat\n' +
            '      at oathbreaker (node_modules/unexpected/lib/oathbreaker.js:46:19)\n' +
            '      at Function.Unexpected.withError (node_modules/unexpected-sinon/lib/unexpected-sinon.js:123:1)\n' +
            '      at Function.Unexpected.withError (node_modules/unexpected/lib/Unexpected.js:792:12)\n' +
            '      at Function.<anonymous> (node_modules/unexpected/lib/assertions.js:569:16)\n' +
            '      at functionCalledByCustomHandler (test/my.spec.js:42:666)\n' +
            '      at myCustomHandler (test/assertions.js:666:42)\n' +
            '      at executeExpect (node_modules/unexpected/lib/Unexpected.js:1103:50)\n' +
            '      at Unexpected.expect (node_modules/unexpected/lib/Unexpected.js:1111:22)\n' +
            '      at Context.<anonymous> (test/my.spec.js:48:17)';

          err.serializeMessage('text');

          expect(err, 'to satisfy', {
            stack:
              'wat\n' +
              '      at functionCalledByCustomHandler (test/my.spec.js:42:666)\n' +
              '      at Context.<anonymous> (test/my.spec.js:48:17)\n' +
              '      set UNEXPECTED_FULL_TRACE=true to see the full stack trace'
          });
        })
      );
    });

    describe('and the output format is set to html', () => {
      it('shows a helping message about how to turn of stack trace trimming', () => {
        expect(
          function() {
            expect.fail('wat');
          },
          'to throw',
          expect.it(function(err) {
            err.useFullStackTrace = false;
            err._hasSerializedErrorMessage = false;
            err.stack =
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
              stack:
                'wat\n' +
                '      at Context.<anonymous> (test/Insection.spec.js:48:17)\n' +
                '      set the query parameter full-trace=true to see the full stack trace'
            });
          })
        );
      });
    });
  });

  describe('when full stack traces is enabled', () => {
    it('the initial stack is preserved', () => {
      expect(
        function() {
          expect.fail('wat');
        },
        'to throw',
        expect.it(function(err) {
          err.useFullStackTrace = true;
          err._hasSerializedErrorMessage = false;
          err.stack =
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
            stack:
              'wat\n' +
              '      at oathbreaker (node_modules/unexpected/lib/oathbreaker.js:46:19)\n' +
              '      at Function.Unexpected.withError (node_modules/unexpected-sinon/lib/unexpected-sinon.js:123:1)\n' +
              '      at Function.Unexpected.withError (node_modules/unexpected/lib/Unexpected.js:792:12)\n' +
              '      at Function.<anonymous> (node_modules/unexpected/lib/assertions.js:569:16)\n' +
              '      at executeExpect (node_modules/unexpected/lib/Unexpected.js:1103:50)\n' +
              '      at Unexpected.expect (node_modules/unexpected/lib/Unexpected.js:1111:22)\n' +
              '      at Context.<anonymous> (test/Insection.spec.js:48:17)'
          });
        })
      );
    });
  });

  describe('when an originalError instance is passed', () => {
    if (
      typeof navigator === 'undefined' ||
      !/phantom/i.test(navigator.userAgent)
    ) {
      it('should give up', () => {
        return expect(
          function() {
            return expect(function() {
              try {
                throw new Error('argh');
              } catch (err) {
                err.stack = 'foobarquux\n   at yaddayadda';
                throw err;
              }
            }, 'not to error');
          },
          'to error',
          expect.it(function(err) {
            expect(err.stack, 'to contain', 'foobarquux\n   at yaddayadda');
          })
        );
      });
    }
  });

  describe('#stack', () => {
    if (
      typeof navigator === 'undefined' ||
      !/phantom/i.test(navigator.userAgent)
    ) {
      it('should not mess up when the error message contains $&', () => {
        return expect(() => expect('$&', 'to equal', 'foo'), 'to error').then(
          err => {
            expect(err.stack, 'to contain', '$&');
          }
        );
      });
    }
  });
});
