/*global expect*/
describe('to be fulfilled with assertion', () => {
  it('should succeed if the response is resolved with a reason satisfying the argument', () => {
    return expect(
      new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(123);
        }, 0);
      }),
      'to be fulfilled with',
      123
    );
  });

  it('should forward the fulfillment value', () => {
    return expect(
      expect.promise.resolve(123),
      'to be fulfilled with',
      123
    ).then(function(value) {
      expect(value, 'to equal', 123);
    });
  });

  it('should fail if the promise is resolved with a value that does not satisfy the argument', () => {
    return expect(
      expect(
        new Promise(function(resolve, reject) {
          setTimeout(function() {
            resolve({ foo: 'bar', baz: 'quux' });
          }, 1);
        }),
        'to be fulfilled with',
        { baz: 'qux' }
      ),
      'to be rejected with',
      "expected Promise to be fulfilled with { baz: 'qux' }\n" +
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

  describe('when matching the fulfillment value against an expect.it', () => {
    it('should succeed', () => {
      return expect(
        new Promise(function(resolve) {
          resolve(123);
        }),
        'to be fulfilled with',
        expect.it(value => {
          expect(value, 'to equal', 123);
        })
      );
    });

    it('should fail with a diff', () => {
      return expect(
        expect(
          new Promise(function(resolve) {
            resolve(123);
          }),
          'to be fulfilled with',
          expect.it(function(value) {
            expect(value, 'to equal', 456);
          })
        ),
        'to be rejected with',
        'expected Promise to be fulfilled with\n' +
          'expect.it(function (value) {\n' +
          "  expect(value, 'to equal', 456);\n" +
          '})\n' +
          '  expected 123 to satisfy\n' +
          '  expect.it(function (value) {\n' +
          "    expect(value, 'to equal', 456);\n" +
          '  })\n' +
          '\n' +
          '  expected 123 to equal 456'
      );
    });
  });

  describe('when passed a function', () => {
    it('should fail if the function returns a promise that is fulfilled with the wrong value', () => {
      expect(
        function() {
          return expect(
            function() {
              return expect.promise.resolve(123);
            },
            'to be fulfilled with',
            456
          );
        },
        'to throw',
        'expected\n' +
          'function () {\n' +
          '  return expect.promise.resolve(123);\n' +
          '}\n' +
          'to be fulfilled with 456\n' +
          '  expected Promise (fulfilled) => 123 to be fulfilled with value satisfying 456\n' +
          '    expected 123 to equal 456'
      );
    });
  });
});
