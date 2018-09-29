/*global expect*/
describe('when rejected adverbial assertion', () => {
  it('should delegate to the next assertion with the rejection reason', () => {
    return expect(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ foo: 'bar' });
        }, 0);
      }),
      'when rejected',
      'to satisfy',
      { foo: 'bar' }
    );
  });

  it('should fail when the next assertion fails', () => {
    return expect(
      expect(
        new Promise((resolve, reject) => {
          setTimeout(() => {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({ foo: 'bar' });
          }, 0);
        }),
        'when rejected',
        'to satisfy',
        { foo: 'baz' }
      ),
      'to be rejected with',
      "expected Promise when rejected to satisfy { foo: 'baz' }\n" +
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

  it('should fail if the promise is fulfilled', () => {
    return expect(
      expect(
        new Promise((resolve, reject) => {
          setTimeout(resolve, 0);
        }),
        'when rejected',
        'to equal',
        new Error('unhappy times')
      ),
      'to be rejected with',
      "expected Promise when rejected to equal Error('unhappy times')\n" +
        '  Promise unexpectedly fulfilled'
    );
  });

  it('should fail if the promise is fulfilled with a value', () => {
    return expect(
      expect(
        new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve('happy times');
          }, 0);
        }),
        'when rejected',
        'to equal',
        new Error('unhappy times')
      ),
      'to be rejected with',
      "expected Promise when rejected to equal Error('unhappy times')\n" +
        "  Promise unexpectedly fulfilled with 'happy times'"
    );
  });

  describe('when passed a function', () => {
    it('should succeed if the function returns a promise that is rejected', () => {
      return expect(() => {
        return expect.promise(() => {
          throw new Error('foo');
        });
      }, 'when rejected to be an object');
    });

    it('should fail if the function returns a promise that is fulfilled', () => {
      expect(
        () => {
          return expect(() => {
            return expect.promise.resolve(123);
          }, 'when rejected to be an object');
        },
        'to throw',
        'expected\n' +
          'function () {\n' +
          '  return expect.promise.resolve(123);\n' +
          '}\n' +
          'when rejected to be an object\n' +
          '  expected Promise (fulfilled) => 123 when rejected to be an object\n' +
          '    Promise (fulfilled) => 123 unexpectedly fulfilled with 123'
      );
    });

    it('should succeed if the function throws synchronously', () => {
      return expect(
        () => {
          throw new Error('foo');
        },
        'when rejected to be an',
        Error
      );
    });
  });

  it('should use the stack of the thrown error when failing', () => {
    return expect(
      () => {
        return expect(
          () => {
            return expect.promise(() => {
              (function thisIsImportant() {
                throw new Error('argh');
              })();
            });
          },
          'when rejected to have message',
          'yay'
        );
      },
      'to error',
      err => {
        expect(err.stack, 'to match', /thisIsImportant/);
      }
    );
  });
});
