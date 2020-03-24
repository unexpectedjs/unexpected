/* global expect */
describe('to throw a/an assertion', () => {
  it('fails if no exception is thrown', () => {
    expect(
      function () {
        expect(
          function () {
            // Don't throw
          },
          'to throw an',
          Error
        );
      },
      'to throw',
      expect.it(function (err) {
        var message = err.getErrorMessage({ format: 'text' }).toString();

        expect(
          message,
          'to equal',
          'expected\n' +
            'function () {\n' +
            "  // Don't throw\n" +
            '}\n' +
            'to throw an Error\n' +
            '  expected function to throw\n' +
            '    did not throw'
        );
      })
    );
  });

  it('succeeds if the function throws an instance of the supplied constructor function', () => {
    expect(
      function () {
        throw new SyntaxError();
      },
      'to throw a',
      SyntaxError
    );
  });

  it('fulfills its promise with the error that was thrown', () => {
    const err = new SyntaxError('foo');
    expect(
      function () {
        throw err;
      },
      'to throw a',
      SyntaxError
    ).then((fulfilmentValue) => expect(fulfilmentValue, 'to be', err));
  });

  it('fails if the function throws an instance of a different constructor', () => {
    expect(
      function () {
        expect(
          function () {
            throw new SyntaxError('foo');
          },
          'to throw a',
          RangeError
        );
      },
      'to throw',
      "expected function () { throw new SyntaxError('foo'); } to throw a RangeError\n" +
        "  expected SyntaxError('foo') to be a RangeError"
    );
  });

  it('fails with a proper error if the function throws null', () => {
    expect(
      function () {
        expect(
          // prettier-ignore
          // eslint-disable-next-line no-throw-literal
          function() { throw null; },
          'to throw a',
          RangeError
        );
      },
      'to throw',
      'expected function () { throw null; } to throw a RangeError\n' +
        '  expected null to be a RangeError'
    );
  });

  it('fails with a proper error if the function throws an empty string', () => {
    expect(
      function () {
        expect(
          // prettier-ignore
          // eslint-disable-next-line no-throw-literal
          function() { throw ''; },
          'to throw a',
          RangeError
        );
      },
      'to throw',
      "expected function () { throw ''; } to throw a RangeError\n" +
        "  expected '' to be a RangeError"
    );
  });
});
