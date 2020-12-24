/* global expect */
describe('to be rejected with error satisfying assertion', () => {
  it('should succeed if the response is rejected with a reason satisfying the argument', () => {
    return expect(
      new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error('OMG!'));
        }, 0);
      })
    ).toBeRejectedWithErrorSatisfying(new Error('OMG!'));
  });

  it('should provide the rejection reason as the fulfillment value', () => {
    return expect(expect.promise.reject(new Error('foo')))
      .toBeRejectedWithErrorSatisfying('foo')
      .then(function (reason) {
        expect(reason).toHaveMessage('foo');
      });
  });

  it('should support matching the error message against a regular expression', () => {
    return expect(
      new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error('OMG!'));
        }, 0);
      })
    ).toBeRejectedWithErrorSatisfying(/MG/);
  });

  it('should support matching the error message of an UnexpectedError against a regular expression', () => {
    return expect(
      new Promise(function (resolve, reject) {
        setTimeout(function () {
          try {
            expect(false).toBeTruthy();
          } catch (err) {
            reject(err);
          }
        }, 0);
      })
    ).toBeRejectedWithErrorSatisfying(/to be/);
  });

  it('should fail if the promise is rejected with a reason that does not satisfy the argument', () => {
    return expect(
      expect(
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(new Error('OMG!'));
          }, 1);
        })
      ).toBeRejectedWithErrorSatisfying(new Error('foobar'))
    ).toBeRejectedWith(
      "expected Promise to be rejected with error satisfying Error('foobar')\n" +
        "  expected Error('OMG!') to satisfy Error('foobar')\n" +
        '\n' +
        '  Error({\n' +
        "    message: 'OMG!' // should equal 'foobar'\n" +
        '                    //\n' +
        '                    // -OMG!\n' +
        '                    // +foobar\n' +
        '  })'
    );
  });

  describe('with the "exhaustively" flag', () => {
    it("errors if the rejection reason doesn't have all the same properties as the value", () => {
      return expect(function () {
        const error = new Error('foobar');
        error.data = { foo: 'bar' };
        return expect(
          expect.promise.reject(error)
        ).toBeRejectedWithErrorExhaustivelySatisfying(new Error('foobar'));
      }).toError();
    });

    it('errors with the correct error', () => {
      return expect(function () {
        const error = new Error('foobar');
        error.data = { foo: 'bar' };
        return expect(
          expect.promise.reject(error)
        ).toBeRejectedWithErrorExhaustivelySatisfying(new Error('foobar'));
      }).toErrorWith(
        "expected Promise (rejected) => Error({ message: 'foobar', data: { foo: 'bar' } })\n" +
          "to be rejected with error exhaustively satisfying Error('foobar')\n" +
          "  expected Error({ message: 'foobar', data: { foo: 'bar' } })\n" +
          "  to exhaustively satisfy Error('foobar')\n" +
          '\n' +
          '  Error({\n' +
          "    message: 'foobar',\n" +
          "    data: { foo: 'bar' } // should be removed\n" +
          '  })'
      );
    });
  });

  describe('without the "exhaustively" flag', () => {
    it("does not error if the rejection reason doesn't have all the same properties as the value", () => {
      return expect(function () {
        const error = new Error('foobar');
        error.data = { foo: 'bar' };
        return expect(
          expect.promise.reject(error)
        ).toBeRejectedWithErrorSatisfying(new Error('foobar'));
      }).notToError();
    });
  });

  describe('when passed a function as the subject', () => {
    it('should fail if the function returns a promise that is rejected with the wrong reason', () => {
      expect(function () {
        return expect(function () {
          return expect.promise.reject(new Error('foo'));
        }).toBeRejectedWithErrorSatisfying(new Error('bar'));
      }).toThrow(
        'expected\n' +
          'function () {\n' +
          "  return expect.promise.reject(new Error('foo'));\n" +
          '}\n' +
          "to be rejected with error satisfying Error('bar')\n" +
          "  expected Promise (rejected) => Error('foo')\n" +
          "  to be rejected with error satisfying Error('bar')\n" +
          "    expected Error('foo') to satisfy Error('bar')\n" +
          '\n' +
          '    Error({\n' +
          "      message: 'foo' // should equal 'bar'\n" +
          '                     //\n' +
          '                     // -foo\n' +
          '                     // +bar\n' +
          '    })'
      );
    });

    it('should use the stack of the rejection reason when failing', () => {
      return expect(function () {
        return expect(function () {
          return expect.promise(function () {
            (function thisIsImportant() {
              throw new Error('argh');
            })();
          });
        }).toBeRejectedWithErrorSatisfying('foobar');
      }).toError(
        expect.it(function (err) {
          expect(err.stack).toMatch(/thisIsImportant/);
        })
      );
    });

    describe('with the "exhaustively" flag', () => {
      it("errors if the rejection reason doesn't have all the same properties as the value", () => {
        return expect(function () {
          return expect(function () {
            return expect.promise(function () {
              const error = new Error('foobar');
              error.data = { foo: 'bar' };
              throw error;
            });
          }).toBeRejectedWithErrorExhaustivelySatisfying(new Error('foobar'));
        }).toError();
      });

      it('errors with the correct error', () => {
        return expect(
          // prettier-ignore
          function () {
            return expect(
              /* eslint-disable no-var */
              function() {
                return expect.promise(function () {
                  var error = new Error('foobar');
                  error.data = { foo: 'bar' };
                  throw error;
                });
              }).toBeRejectedWithErrorExhaustivelySatisfying(new Error('foobar')
            );
          }
        ).toErrorWith(
          'expected\n' +
            'function () {\n' +
            '  return expect.promise(function () {\n' +
            "    var error = new Error('foobar');\n" +
            "    error.data = { foo: 'bar' };\n" +
            '    throw error;\n' +
            '  });\n' +
            '}\n' +
            "to be rejected with error exhaustively satisfying Error('foobar')\n" +
            "  expected Promise (rejected) => Error({ message: 'foobar', data: { foo: 'bar' } })\n" +
            "  to be rejected with error exhaustively satisfying Error('foobar')\n" +
            "    expected Error({ message: 'foobar', data: { foo: 'bar' } })\n" +
            "    to exhaustively satisfy Error('foobar')\n" +
            '\n' +
            '    Error({\n' +
            "      message: 'foobar',\n" +
            "      data: { foo: 'bar' } // should be removed\n" +
            '    })'
        );
      });
    });

    describe('without the "exhaustively" flag', () => {
      it("does not error if the rejection reason doesn't have all the same properties as the value", () => {
        return expect(function () {
          return expect(function () {
            return expect.promise(function () {
              const error = new Error('foobar');
              error.data = { foo: 'bar' };
              throw error;
            });
          }).toBeRejectedWithErrorSatisfying(new Error('foobar'));
        }).notToError();
      });
    });
  });

  describe('with another promise library', () => {
    it('should use the stack of the rejection reason when failing', () => {
      return expect(function () {
        return expect(function () {
          return new Promise(function (resolve, reject) {
            (function thisIsImportant() {
              throw new Error('argh');
            })();
          });
        }).toBeRejectedWithErrorSatisfying('foobar');
      }).toError(
        expect.it(function (err) {
          expect(err.stack).toMatch(/thisIsImportant/);
        })
      );
    });
  });
});
