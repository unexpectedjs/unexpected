/* global expect */
describe('to be rejected assertion', () => {
  it('should succeed if the response is rejected for any reason', () => {
    return expect(
      new Promise(function (resolve, reject) {
        setTimeout(function () {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject();
        }, 0);
      })
    ).toBeRejected();
  });

  it('should provide the rejection reason as the fulfillment value', () => {
    return expect(expect.promise.reject(new Error('foo')))
      .toBeRejected()
      .then(function (reason) {
        expect(reason).toHaveMessage('foo');
      });
  });

  it('should succeed if the promise is rejected without a reason', () => {
    return expect(
      expect(
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve('happy times');
          }, 0);
        })
      ).toBeRejected()
    ).toBeRejectedWith(
      'expected Promise to be rejected\n' +
        "  Promise unexpectedly fulfilled with 'happy times'"
    );
  });

  it('should fail if the promise is fulfilled', () => {
    return expect(
      expect(
        new Promise(function (resolve, reject) {
          setTimeout(resolve, 0);
        })
      ).toBeRejected()
    ).toBeRejectedWith(
      'expected Promise to be rejected\n' + '  Promise unexpectedly fulfilled'
    );
  });

  it('should fail if the promise is fulfilled with a value', () => {
    return expect(
      expect(
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve('happy times');
          }, 0);
        })
      ).toBeRejected()
    ).toBeRejectedWith(
      'expected Promise to be rejected\n' +
        "  Promise unexpectedly fulfilled with 'happy times'"
    );
  });

  describe('when passed a function', () => {
    it('should succeed if the function returns a promise that is rejected', () => {
      return expect(function () {
        return expect.promise.reject(new Error('foo'));
      }).toBeRejected();
    });

    it('should forward the rejection reason', () => {
      return expect(function () {
        return expect.promise(function () {
          return expect.promise.reject(new Error('foo'));
        });
      })
        .toBeRejected()
        .then(function (err) {
          expect(err).toHaveMessage('foo');
        });
    });

    it('should fail if the function returns a promise that is fulfilled', () => {
      expect(function () {
        return expect(function () {
          return expect.promise.resolve(123);
        }).toBeRejected();
      }).toThrow(
        'expected\n' +
          'function () {\n' +
          '  return expect.promise.resolve(123);\n' +
          '}\n' +
          'to be rejected\n' +
          '  expected Promise (fulfilled) => 123 to be rejected\n' +
          '    Promise (fulfilled) => 123 unexpectedly fulfilled with 123'
      );
    });

    it('should succeed if the function throws synchronously', () => {
      return expect(function () {
        throw new Error('foo');
      }).toBeRejected();
    });
  });
});
