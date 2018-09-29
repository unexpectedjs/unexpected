/*global expect*/
describe('when fulfilled adverbial assertion', () => {
  it('should delegate to the next assertion with the resolved value', () => {
    return expect(
      new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve({ foo: 'bar' });
        }, 0);
      }),
      'when fulfilled',
      'to satisfy',
      { foo: 'bar' }
    );
  });

  it('should support expect.it', () => {
    return expect(
      new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve({ foo: 'bar' });
        }, 0);
      }),
      'when fulfilled',
      expect.it('to have property', 'foo', 'bar')
    );
  });

  it('should fail when the promise is rejected', () => {
    return expect(
      expect(
        new Promise(function(resolve, reject) {
          setTimeout(function() {
            reject(new Error('ugh'));
          }, 0);
        }),
        'when fulfilled',
        'to satisfy',
        { foo: 'baz' }
      ),
      'to be rejected with',
      "expected Promise when fulfilled to satisfy { foo: 'baz' }\n" +
        "  Promise unexpectedly rejected with Error('ugh')"
    );
  });

  it('should fail when the promise is rejected with a value of undefined', () => {
    return expect(
      expect(
        new Promise(function(resolve, reject) {
          setTimeout(reject, 0);
        }),
        'when fulfilled',
        'to satisfy',
        { foo: 'baz' }
      ),
      'to be rejected with',
      "expected Promise when fulfilled to satisfy { foo: 'baz' }\n" +
        '  Promise unexpectedly rejected'
    );
  });

  it('should fail when the next assertion fails', () => {
    return expect(
      expect(
        new Promise(function(resolve, reject) {
          setTimeout(function() {
            resolve({ foo: 'bar' });
          }, 0);
        }),
        'when fulfilled',
        'to satisfy',
        { foo: 'baz' }
      ),
      'to be rejected with',
      "expected Promise when fulfilled to satisfy { foo: 'baz' }\n" +
        "  expected { foo: 'bar' } to satisfy { foo: 'baz' }\n" +
        '\n' +
        '  {\n' +
        "    foo: 'bar' // should equal 'baz'\n" +
        '               //\n' +
        '               // -bar\n' +
        '               // +baz\n' +
        '  }'
    );
  });

  it('should fail with the right error message when the next assertion is an expect.it that fails', () => {
    return expect(
      expect(
        new Promise(function(resolve, reject) {
          setTimeout(function() {
            resolve({ foo: 'bar' });
          }, 0);
        }),
        'when fulfilled',
        expect.it('to have property', 'foo', 'quux')
      ),
      'to be rejected with',
      "expected Promise when fulfilled expect.it('to have property', 'foo', 'quux')\n" +
        "  expected { foo: 'bar' } to have property 'foo' with a value of 'quux'\n" +
        '\n' +
        '  -bar\n' +
        '  +quux'
    );
  });

  describe('when passed a function', () => {
    it('should succeed if the function returns a promise that succeeds', () => {
      return expect(function() {
        return expect.promise(function() {
          return 123;
        });
      }, 'when fulfilled to be a number');
    });

    it('should fail if the function returns a promise that fails', () => {
      expect(
        function() {
          return expect(function() {
            return expect.promise.reject(new Error('foo'));
          }, 'when fulfilled to be a number');
        },
        'to throw',
        'expected\n' +
          'function () {\n' +
          "  return expect.promise.reject(new Error('foo'));\n" +
          '}\n' +
          'when fulfilled to be a number\n' +
          "  expected Promise (rejected) => Error('foo') when fulfilled to be a number\n" +
          "    Promise (rejected) => Error('foo') unexpectedly rejected with Error('foo')"
      );
    });

    it('should fail if the function throws synchronously', () => {
      expect(
        function() {
          return expect(function() {
            throw new Error('foo');
          }, 'when fulfilled to be a number');
        },
        'to throw',
        "expected function () { throw new Error('foo'); } when fulfilled to be a number\n" +
          "  expected Promise (rejected) => Error('foo') when fulfilled to be a number\n" +
          "    Promise (rejected) => Error('foo') unexpectedly rejected with Error('foo')"
      );
    });
  });

  it('should use the stack of the thrown error when failing', () => {
    return expect(
      function() {
        return expect(
          function() {
            return expect.promise(function() {
              (function thisIsImportant() {
                throw new Error('argh');
              })();
            });
          },
          'when fulfilled to equal',
          'yay'
        );
      },
      'to error',
      function(err) {
        expect(err.stack, 'to match', /thisIsImportant/);
      }
    );
  });
});
