/*global expect*/
describe('to be rejected assertion', () => {
  it('should succeed if the response is rejected for any reason', () => {
    return expect(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject();
        }, 0);
      }),
      'to be rejected'
    );
  });

  it('should provide the rejection reason as the fulfillment value', () => {
    return expect(
      expect.promise.reject(new Error('foo')),
      'to be rejected'
    ).then(reason => {
      expect(reason, 'to have message', 'foo');
    });
  });

  it('should succeed if the promise is rejected without a reason', () => {
    return expect(
      expect(
        new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve('happy times');
          }, 0);
        }),
        'to be rejected'
      ),
      'to be rejected with',
      'expected Promise to be rejected\n' +
        "  Promise unexpectedly fulfilled with 'happy times'"
    );
  });

  it('should fail if the promise is fulfilled', () => {
    return expect(
      expect(
        new Promise((resolve, reject) => {
          setTimeout(resolve, 0);
        }),
        'to be rejected'
      ),
      'to be rejected with',
      'expected Promise to be rejected\n' + '  Promise unexpectedly fulfilled'
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
        'to be rejected'
      ),
      'to be rejected with',
      'expected Promise to be rejected\n' +
        "  Promise unexpectedly fulfilled with 'happy times'"
    );
  });

  describe('when passed a function', () => {
    it('should succeed if the function returns a promise that is rejected', () => {
      return expect(() => {
        return expect.promise.reject(new Error('foo'));
      }, 'to be rejected');
    });

    it('should forward the rejection reason', () => {
      return expect(() => {
        return expect.promise(() => {
          return expect.promise.reject(new Error('foo'));
        });
      }, 'to be rejected').then(err => {
        expect(err, 'to have message', 'foo');
      });
    });

    it('should fail if the function returns a promise that is fulfilled', () => {
      expect(
        () => {
          return expect(() => {
            return expect.promise.resolve(123);
          }, 'to be rejected');
        },
        'to throw',
        'expected\n' +
          '() => {\n' +
          '  return expect.promise.resolve(123);\n' +
          '}\n' +
          'to be rejected\n' +
          '  expected Promise (fulfilled) => 123 to be rejected\n' +
          '    Promise (fulfilled) => 123 unexpectedly fulfilled with 123'
      );
    });

    it('should succeed if the function throws synchronously', () => {
      return expect(() => {
        throw new Error('foo');
      }, 'to be rejected');
    });
  });
});
