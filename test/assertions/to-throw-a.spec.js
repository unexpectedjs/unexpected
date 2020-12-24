/* global expect */
describe('to throw a/an assertion', () => {
  it('fails if no exception is thrown', () => {
    expect(function () {
      expect(function () {
        // Don't throw
      }).toThrowAn(Error);
    }).toThrow(
      expect.it(function (err) {
        const message = err.getErrorMessage({ format: 'text' }).toString();

        expect(message).toEqual(
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
    expect(function () {
      throw new SyntaxError();
    }).toThrowA(SyntaxError);
  });

  it('fulfills its promise with the error that was thrown', () => {
    const err = new SyntaxError('foo');
    expect(function () {
      throw err;
    })
      .toThrowA(SyntaxError)
      .then((fulfilmentValue) => expect(fulfilmentValue).toBe(err));
  });

  it('fails if the function throws an instance of a different constructor', () => {
    expect(function () {
      expect(function () {
        throw new SyntaxError('foo');
      }).toThrowA(RangeError);
    }).toThrow(
      "expected function () { throw new SyntaxError('foo'); } to throw a RangeError\n" +
        "  expected SyntaxError('foo') to be a RangeError"
    );
  });

  it('fails with a proper error if the function throws null', () => {
    expect(function () {
      expect(
        // prettier-ignore
        // eslint-disable-next-line no-throw-literal
        function() { throw null; }
      ).toThrowA(RangeError);
    }).toThrow(
      'expected function () { throw null; } to throw a RangeError\n' +
        '  expected null to be a RangeError'
    );
  });

  it('fails with a proper error if the function throws an empty string', () => {
    expect(function () {
      expect(
        // prettier-ignore
        // eslint-disable-next-line no-throw-literal
        function() { throw ''; }
      ).toThrowA(RangeError);
    }).toThrow(
      "expected function () { throw ''; } to throw a RangeError\n" +
        "  expected '' to be a RangeError"
    );
  });
});
