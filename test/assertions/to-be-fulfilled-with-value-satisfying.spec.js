/* global expect */
describe('to be fulfilled with value satisfying assertion', () => {
  it('should succeed if the response is resolved with a value satisfying the argument', () => {
    return expect(
      new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(123);
        }, 0);
      }),
      'to be fulfilled with value satisfying',
      123
    );
  });

  it('should forward the fulfillment value', () => {
    return expect(
      expect.promise.resolve(123),
      'to be fulfilled with value satisfying',
      123
    ).then(function (value) {
      expect(value, 'to equal', 123);
    });
  });

  it('should fail if the promise is resolved with a value that does not satisfy the argument', () => {
    return expect(
      expect(
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve({ foo: 'bar', baz: 'quux' });
          }, 1);
        }),
        'to be fulfilled with value satisfying',
        { baz: 'qux' }
      ),
      'to be rejected with',
      "expected Promise to be fulfilled with value satisfying { baz: 'qux' }\n" +
        "  expected { foo: 'bar', baz: 'quux' } to satisfy { baz: 'qux' }\n" +
        '\n' +
        '  {\n' +
        "    foo: 'bar',\n" +
        "    baz: 'quux' // should equal 'qux'\n" +
        '                //\n' +
        '                // -quux\n' +
        '                // +qux\n' +
        '  }'
    );
  });

  describe('with the "exhaustively" flag', () => {
    it("errors if the expected value doesn't contain all the values in the subject", () => {
      return expect(
        expect(
          Promise.resolve({
            foo: 'foo',
            bar: 'bar',
            quux: 'quux',
          }),
          'to be fulfilled with value exhaustively satisfying',
          {
            foo: 'foo',
            bar: 'bar',
          }
        ),
        'to be rejected'
      );
    });

    it('errors with the correct error', () => {
      return expect(
        expect(
          Promise.resolve({
            foo: 'foo',
            bar: 'bar',
            quux: 'quux',
          }),
          'to be fulfilled with value exhaustively satisfying',
          {
            foo: 'foo',
            bar: 'bar',
          }
        ),
        'to be rejected with',
        'expected Promise\n' +
          "to be fulfilled with value exhaustively satisfying { foo: 'foo', bar: 'bar' }\n" +
          "  expected { foo: 'foo', bar: 'bar', quux: 'quux' }\n" +
          "  to exhaustively satisfy { foo: 'foo', bar: 'bar' }\n" +
          '\n' +
          '  {\n' +
          "    foo: 'foo',\n" +
          "    bar: 'bar',\n" +
          "    quux: 'quux' // should be removed\n" +
          '  }'
      );
    });
  });

  describe('without the "exhaustively" flag', () => {
    it("doesn't error if the expected value doesn't contain all the values in the subject", () => {
      return expect(
        expect.promise.resolve({
          foo: 'foo',
          bar: 'bar',
          quux: 'quux',
        }),
        'to be fulfilled with value satisfying',
        {
          foo: 'foo',
          bar: 'bar',
        }
      );
    });
  });

  describe('when passed a function as the subject', () => {
    it('should fail if the function returns a promise that is fulfilled with the wrong value', () => {
      expect(
        function () {
          return expect(
            function () {
              return expect.promise.resolve(123);
            },
            'to be fulfilled with value satisfying',
            456
          );
        },
        'to throw',
        'expected\n' +
          'function () {\n' +
          '  return expect.promise.resolve(123);\n' +
          '}\n' +
          'to be fulfilled with value satisfying 456\n' +
          '  expected Promise (fulfilled) => 123 to be fulfilled with value satisfying 456\n' +
          '    expected 123 to equal 456'
      );
    });

    describe('with the "exhaustively" flag', () => {
      it("errors if the expected value doesn't contain all the values in the subject", () => {
        return expect(function () {
          return expect(
            function () {
              return Promise.resolve({
                foo: 'foo',
                bar: 'bar',
                quux: 'quux',
              });
            },
            'to be fulfilled with value exhaustively satisfying',
            {
              foo: 'foo',
              bar: 'bar',
            }
          );
        }, 'to be rejected');
      });

      it('errors with the correct error', () => {
        return expect(
          function () {
            return expect(
              function () {
                return Promise.resolve({
                  foo: 'foo',
                  bar: 'bar',
                  quux: 'quux',
                });
              },
              'to be fulfilled with value exhaustively satisfying',
              {
                foo: 'foo',
                bar: 'bar',
              }
            );
          },
          'to be rejected with',
          'expected\n' +
            'function () {\n' +
            '  return Promise.resolve({\n' +
            "    foo: 'foo',\n" +
            "    bar: 'bar',\n" +
            "    quux: 'quux',\n" +
            '  });\n' +
            '}\n' +
            "to be fulfilled with value exhaustively satisfying { foo: 'foo', bar: 'bar' }\n" +
            "  expected Promise (fulfilled) => { foo: 'foo', bar: 'bar', quux: 'quux' }\n" +
            "  to be fulfilled with value exhaustively satisfying { foo: 'foo', bar: 'bar' }\n" +
            "    expected { foo: 'foo', bar: 'bar', quux: 'quux' }\n" +
            "    to exhaustively satisfy { foo: 'foo', bar: 'bar' }\n" +
            '\n' +
            '    {\n' +
            "      foo: 'foo',\n" +
            "      bar: 'bar',\n" +
            "      quux: 'quux' // should be removed\n" +
            '    }'
        );
      });
    });

    describe('without the "exhaustively" flag', () => {
      it("doesn't error if the expected value doesn't contain all the values in the subject", () => {
        return expect(
          function () {
            return expect.promise.resolve({
              foo: 'foo',
              bar: 'bar',
              quux: 'quux',
            });
          },
          'to be fulfilled with value satisfying',
          {
            foo: 'foo',
            bar: 'bar',
          }
        );
      });
    });
  });
});
