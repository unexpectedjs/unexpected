/*global expect*/
describe('to throw assertion', () => {
  it('fails if no exception is thrown', () => {
    expect(
      function() {
        expect(function() {
          // Don't throw
        }, 'to throw exception');
      },
      'to throw',
      expect.it(function(err) {
        var message = err.getErrorMessage({ format: 'text' }).toString();
        // PhantomJS adds a semicolon after the comment
        message = message.replace(';', '');
        expect(
          message,
          'to equal',
          'expected\n' +
            'function () {\n' +
            "  // Don't throw\n" +
            '}\n' +
            'to throw exception\n' +
            '  did not throw'
        );
      })
    );
  });

  it('fails if exception is thrown', () => {
    expect(
      function() {
        expect(function testFunction() {
          throw new Error('The Error');
        }, 'not to throw');
      },
      'to throw',
      "expected function testFunction() { throw new Error('The Error'); } not to throw\n" +
        "  threw: Error('The Error')"
    );
  });

  it('fails with the correct message when an Unexpected error is thrown', () => {
    expect(
      // prettier-ignore
      function() {
        expect(function testFunction() {
          expect.fail(function (output) {
            output.text('foo').block(function () {
              this.text('bar').nl().text('baz');
            }).text('quux');
          });
        }, 'not to throw');
      },
      'to throw',
      'expected\n' +
        'function testFunction() {\n' +
        '  expect.fail(function (output) {\n' +
        "    output.text('foo').block(function () {\n" +
        "      this.text('bar').nl().text('baz');\n" +
        "    }).text('quux');\n" +
        '  });\n' +
        '}\n' +
        'not to throw\n' +
        '  threw: foobarquux\n' +
        '            baz'
    );
  });

  it('fails if the argument is not a function', () => {
    expect(
      function() {
        expect(1, 'to throw exception');
      },
      'to throw exception',
      'expected 1 to throw exception\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <number> to throw exception\n' +
        '  did you mean:\n' +
        '    <function> to (throw|throw error|throw exception)\n' +
        '    <function> to (throw|throw error|throw exception) <any>'
    );
  });

  it('given a function the function is called with the exception', () => {
    expect(
      function() {
        throw new SyntaxError();
      },
      'to throw exception',
      expect.it(function(e) {
        expect(e, 'to be a', SyntaxError);
      })
    );
  });

  it('matches the message against the given regular expression', () => {
    expect(
      function() {
        throw new Error('matches the exception message');
      },
      'to throw exception',
      /matches the exception message/
    );
  });

  it('does not support the not-flag in combination with an argument', () => {
    expect(
      function() {
        expect(
          function() {
            throw new Error('matches the exception message');
          },
          'not to throw',
          /matches the exception message/
        );
      },
      'to throw',
      'expected\n' +
        'function () {\n' +
        "  throw new Error('matches the exception message');\n" +
        '}\n' +
        'not to throw /matches the exception message/\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <function> not to throw <regexp>\n' +
        '  did you mean:\n' +
        '    <function> not to throw'
    );
  });

  it('provides a diff when the exception message does not match the given string', () => {
    expect(
      function() {
        expect(
          function testFunction() {
            throw new Error('bar');
          },
          'to throw',
          'foo'
        );
      },
      'to throw exception',
      "expected function testFunction() { throw new Error('bar'); } to throw 'foo'\n" +
        "  expected Error('bar') to satisfy 'foo'\n" +
        '\n' +
        '  -bar\n' +
        '  +foo'
    );
  });

  it('matches the error against the given error instance', () => {
    expect(
      function() {
        throw new Error('matches the exception message');
      },
      'to throw exception',
      new Error('matches the exception message')
    );
  });

  it('provides a diff when the thrown error does not match the given error instance', () => {
    expect(
      function() {
        expect(
          function testFunction() {
            throw new Error('Custom error');
          },
          'to throw exception',
          new Error('My error')
        );
      },
      'to throw',
      'expected\n' +
        'function testFunction() {\n' +
        "  throw new Error('Custom error');\n" +
        '}\n' +
        "to throw exception Error('My error')\n" +
        "  expected Error('Custom error') to satisfy Error('My error')\n" +
        '\n' +
        '  Error({\n' +
        "    message: 'Custom error' // should equal 'My error'\n" +
        '                            //\n' +
        '                            // -Custom error\n' +
        '                            // +My error\n' +
        '  })'
    );
  });

  it('exactly matches the message against the given string', () => {
    expect(
      function() {
        throw new Error('matches the exception message');
      },
      'to throw exception',
      'matches the exception message'
    );
  });

  it('does not break if null is thrown', () => {
    expect(
      function() {
        // prettier-ignore
        // eslint-disable-next-line no-throw-literal
        expect(function() { throw null; }, 'not to throw');
      },
      'to throw',
      'expected function () { throw null; } not to throw\n' + '  threw: null'
    );
  });

  describe('with the not flag', () => {
    it('should use the stack of the thrown error when failing', () => {
      expect(
        function() {
          expect(function() {
            (function thisIsImportant() {
              throw new Error('argh');
            })();
          }, 'not to throw');
        },
        'to throw',
        expect.it(function(err) {
          expect(err.stack, 'to match', /thisIsImportant/);
        })
      );
    });
  });

  describe('without the not flag', () => {
    it('should use the stack of the thrown (but wrong) error when failing', () => {
      expect(
        function() {
          expect(
            function() {
              (function thisIsImportant() {
                throw new Error('argh');
              })();
            },
            'to throw',
            'foo'
          );
        },
        'to throw',
        expect.it(function(err) {
          expect(err.stack, 'to match', /thisIsImportant/);
        })
      );
    });
  });
});
