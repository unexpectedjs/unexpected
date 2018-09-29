/*global expect*/
describe('to throw assertion', () => {
  it('fails if no exception is thrown', () => {
    expect(
      () => {
        expect(() => {
          // Don't throw
        }, 'to throw exception');
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
            'to throw exception\n' +
            '  did not throw'
        );
      }
    );
  });

  it('fails if exception is thrown', () => {
    expect(
      () => {
        expect(() => {
          throw new Error('The Error');
        }, 'not to throw');
      },
      'to throw',
      "expected () => { throw new Error('The Error'); } not to throw\n" +
        "  threw: Error('The Error')"
    );
  });

  it('fails with the correct message when an Unexpected error is thrown', () => {
    expect(
      // prettier-ignore
      () => {
        expect(() => {
          expect.fail(output => {
            output.text('foo').block(function () {
              this.text('bar').nl().text('baz');
            }).text('quux');
          });
        }, 'not to throw');
      },
      'to throw',
      'expected\n' +
        '() => {\n' +
        '  expect.fail(output => {\n' +
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
      () => {
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
      () => {
        throw new SyntaxError();
      },
      'to throw exception',
      e => {
        expect(e, 'to be a', SyntaxError);
      }
    );
  });

  it('matches the message against the given regular expression', () => {
    expect(
      () => {
        throw new Error('matches the exception message');
      },
      'to throw exception',
      /matches the exception message/
    );
  });

  it('does not support the not-flag in combination with an argument', () => {
    expect(
      () => {
        expect(
          () => {
            throw new Error('matches the exception message');
          },
          'not to throw',
          /matches the exception message/
        );
      },
      'to throw',
      'expected\n' +
        '() => {\n' +
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
      () => {
        expect(
          () => {
            throw new Error('bar');
          },
          'to throw',
          'foo'
        );
      },
      'to throw exception',
      "expected () => { throw new Error('bar'); } to throw 'foo'\n" +
        "  expected Error('bar') to satisfy 'foo'\n" +
        '\n' +
        '  -bar\n' +
        '  +foo'
    );
  });

  it('matches the error against the given error instance', () => {
    expect(
      () => {
        throw new Error('matches the exception message');
      },
      'to throw exception',
      new Error('matches the exception message')
    );
  });

  it('provides a diff when the thrown error does not match the given error instance', () => {
    expect(
      () => {
        expect(
          () => {
            throw new Error('Custom error');
          },
          'to throw exception',
          new Error('My error')
        );
      },
      'to throw',
      'expected\n' +
        '() => {\n' +
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
      () => {
        throw new Error('matches the exception message');
      },
      'to throw exception',
      'matches the exception message'
    );
  });

  it('does not break if null is thrown', () => {
    expect(
      () => {
        // prettier-ignore
        // eslint-disable-next-line no-throw-literal
        expect(() => { throw null; }, 'not to throw');
      },
      'to throw',
      'expected () => { throw null; } not to throw\n' + '  threw: null'
    );
  });

  describe('with the not flag', () => {
    it('should use the stack of the thrown error when failing', () => {
      expect(
        () => {
          expect(() => {
            (function thisIsImportant() {
              throw new Error('argh');
            })();
          }, 'not to throw');
        },
        'to throw',
        err => {
          expect(err.stack, 'to match', /thisIsImportant/);
        }
      );
    });
  });

  describe('without the not flag', () => {
    it('should use the stack of the thrown (but wrong) error when failing', () => {
      expect(
        () => {
          expect(
            () => {
              (function thisIsImportant() {
                throw new Error('argh');
              })();
            },
            'to throw',
            'foo'
          );
        },
        'to throw',
        err => {
          expect(err.stack, 'to match', /thisIsImportant/);
        }
      );
    });
  });
});
