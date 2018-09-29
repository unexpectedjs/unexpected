/*global expect*/
describe('to be fulfilled assertion', () => {
  it('should succeed if the response is resolved with any value', () => {
    return expect(
      new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve('yay');
        }, 0);
      }),
      'to be fulfilled'
    );
  });

  it('should fail if the promise is rejected', () => {
    return expect(
      expect(
        new Promise(function(resolve, reject) {
          setTimeout(function() {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject('unhappy times');
          }, 0);
        }),
        'to be fulfilled'
      ),
      'to be rejected with',
      'expected Promise to be fulfilled\n' +
        "  Promise unexpectedly rejected with 'unhappy times'"
    );
  });

  it('should fail with the correct message if the promise is rejected without a reason', () => {
    return expect(
      expect(
        new Promise(function(resolve, reject) {
          setTimeout(reject, 0);
        }),
        'to be fulfilled'
      ),
      'to be rejected with',
      'expected Promise to be fulfilled\n' + '  Promise unexpectedly rejected'
    );
  });

  describe('when passed a function', () => {
    it('should succeed if the function returns a promise that succeeds', () => {
      return expect(function() {
        return expect.promise(function() {
          return 123;
        });
      }, 'to be fulfilled');
    });

    it('should forward the fulfillment value', () => {
      return expect(function() {
        return expect.promise(function() {
          return 123;
        });
      }, 'to be fulfilled').then(function(value) {
        expect(value, 'to equal', 123);
      });
    });

    it('should fail if the function returns a promise that fails', () => {
      expect(
        function() {
          return expect(function() {
            return expect.promise.reject(new Error('foo'));
          }, 'to be fulfilled');
        },
        'to throw',
        'expected\n' +
          'function () {\n' +
          "  return expect.promise.reject(new Error('foo'));\n" +
          '}\n' +
          'to be fulfilled\n' +
          "  expected Promise (rejected) => Error('foo') to be fulfilled\n" +
          "    Promise (rejected) => Error('foo') unexpectedly rejected with Error('foo')"
      );
    });

    it('should fail if the function throws synchronously', () => {
      expect(
        function() {
          return expect(function() {
            throw new Error('foo');
          }, 'to be fulfilled');
        },
        'to throw',
        "expected function () { throw new Error('foo'); } to be fulfilled\n" +
          "  expected Promise (rejected) => Error('foo') to be fulfilled\n" +
          "    Promise (rejected) => Error('foo') unexpectedly rejected with Error('foo')"
      );
    });
  });

  it('should use the stack of the thrown error when failing', () => {
    return expect(
      function() {
        return expect(function() {
          return expect.promise(function() {
            (function thisIsImportant() {
              throw new Error('argh');
            })();
          });
        }, 'to be fulfilled');
      },
      'to error',
      function(err) {
        expect(err.stack, 'to match', /thisIsImportant/);
      }
    );
  });

  describe('with another promise library', () => {
    it('should use the stack of the thrown error when failing', () => {
      return expect(
        function() {
          return expect(function() {
            return new Promise(function(resolve, reject) {
              (function thisIsImportant() {
                throw new Error('argh');
              })();
            });
          }, 'to be fulfilled');
        },
        'to error',
        function(err) {
          expect(err.stack, 'to match', /thisIsImportant/);
        }
      );
    });
  });
});
