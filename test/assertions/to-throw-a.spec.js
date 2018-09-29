/*global expect*/
describe('to throw a/an assertion', () => {
  it('fails if no exception is thrown', () => {
    expect(
      () => {
        expect(
          () => {
            // Don't throw
          },
          'to throw an',
          Error
        );
      },
      'to throw',
      err => {
        var message = err.getErrorMessage({ format: 'text' }).toString();
        // PhantomJS adds a semicolon after the comment
        message = message.replace(';', '');
        expect(
          message,
          'to equal',
          'expected\n' +
            '() => {\n' +
            "  // Don't throw\n" +
            '}\n' +
            'to throw an Error\n' +
            '  expected function to throw\n' +
            '    did not throw'
        );
      }
    );
  });

  it('succeeds if the function throws an instance of the supplied constructor function', () => {
    expect(
      () => {
        throw new SyntaxError();
      },
      'to throw a',
      SyntaxError
    );
  });

  it('fails if the function throws an instance of a different constructor', () => {
    expect(
      () => {
        expect(
          () => {
            throw new SyntaxError('foo');
          },
          'to throw a',
          RangeError
        );
      },
      'to throw',
      "expected () => { throw new SyntaxError('foo'); } to throw a RangeError\n" +
        "  expected SyntaxError('foo') to be a RangeError"
    );
  });

  it('fails with a proper error if the function throws null', () => {
    expect(
      () => {
        expect(
          // prettier-ignore
          // eslint-disable-next-line no-throw-literal
          () => { throw null; },
          'to throw a',
          RangeError
        );
      },
      'to throw',
      'expected () => { throw null; } to throw a RangeError\n' +
        '  expected null to be a RangeError'
    );
  });

  it('fails with a proper error if the function throws an empty string', () => {
    expect(
      () => {
        expect(
          // prettier-ignore
          // eslint-disable-next-line no-throw-literal
          () => { throw ''; },
          'to throw a',
          RangeError
        );
      },
      'to throw',
      "expected () => { throw ''; } to throw a RangeError\n" +
        "  expected '' to be a RangeError"
    );
  });
});
