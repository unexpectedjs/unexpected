/*global expect*/
describe('expect.shift', () => {
  describe('when preserving the subject by passing no arguments', () => {
    it('should succeed', () => {
      var clonedExpect = expect
        .clone()
        .addAssertion('<string> blabla <assertion>', (expect, subject) => {
          return expect.shift();
        });
      clonedExpect('foo', 'blabla', 'to equal', 'foo');
    });

    it('should fail with a diff', () => {
      var clonedExpect = expect
        .clone()
        .addAssertion('<string> blabla <assertion>', (expect, subject) => {
          return expect.shift();
        });
      expect(
        () => {
          clonedExpect('foo', 'blabla', 'to equal', 'foobar');
        },
        'to throw',
        "expected 'foo' blabla to equal 'foobar'\n" +
          '\n' +
          '-foo\n' +
          '+foobar'
      );
    });
  });

  it('should support calling shift multiple times', () => {
    var clonedExpect = expect
      .clone()
      .addAssertion(
        '<number> up to [and including] <number> <assertion>',
        (expect, subject, value) => {
          expect.errorMode = 'nested';
          var numbers = [];
          for (
            var i = subject;
            i < (expect.flags['and including'] ? value + 1 : value);
            i += 1
          ) {
            numbers.push(i);
          }
          return expect.promise.all(
            numbers.map(number => {
              return expect.promise(() => {
                return expect.shift(number);
              });
            })
          );
        }
      );

    return expect(
      () => {
        clonedExpect(5, 'up to and including', 100, 'to be within', 1, 90);
      },
      'to error',
      'expected 5 up to and including 100 to be within 1, 90\n' +
        '  expected 91 to be within 1..90'
    );
  });

  describe('when substituting a different subject by passing a single argument', () => {
    it('should succeed', () => {
      var clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when appended with bar <assertion>',
          (expect, subject) => {
            return expect.shift(`${subject}bar`);
          }
        );
      clonedExpect('foo', 'when appended with bar', 'to equal', 'foobar');
    });

    it('should fail with a diff', () => {
      var clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when appended with bar <assertion>',
          (expect, subject) => {
            return expect.shift(`${subject}bar`);
          }
        );
      expect(
        () => {
          clonedExpect('crow', 'when appended with bar', 'to equal', 'foobar');
        },
        'to throw',
        "expected 'crow' when appended with bar to equal 'foobar'\n" +
          '\n' +
          '-crowbar\n' +
          '+foobar'
      );
    });
  });

  it('should identify the assertions even when the next assertion fails before shifting', () => {
    var clonedExpect = expect
      .clone()
      .addAssertion(
        '<string> when appended with bar <assertion>',
        (expect, subject) => {
          if (subject === 'crow') {
            expect.fail();
          }
          return expect.shift(`${subject}bar`);
        }
      );
    expect(
      () => {
        clonedExpect(
          'crow',
          'when appended with bar',
          'when appended with bar',
          'to equal',
          'foobarbar'
        );
      },
      'to throw',
      "expected 'crow' when appended with bar when appended with bar to equal 'foobarbar'"
    );
  });

  it('supports the legacy 3 argument version', () => {
    var clonedExpect = expect
      .clone()
      .addAssertion('<string> when prepended with foo <assertion>', function(
        expect,
        subject
      ) {
        return this.shift(expect, `foo${subject}`, 0);
      });
    clonedExpect(
      'foo',
      'when prepended with foo',
      expect.it('to equal', 'foofoo')
    );
  });

  describe('with the legacy 2 argument version', () => {
    it('inspects multiple arguments correctly', () => {
      var clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when surrounded by <string> <string> <assertion>',
          (expect, subject) => {
            return expect.shift(`foo${subject}`, 2);
          }
        );

      return expect(
        () => {
          clonedExpect(
            'bar',
            'when surrounded by',
            'foo',
            'quux',
            'to be a number'
          );
        },
        'to throw',
        "expected 'bar' when surrounded by 'foo', 'quux' to be a number"
      );
    });
  });

  describe('with an expect.it function as the next argument', () => {
    it('should succeed', () => {
      var clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when prepended with foo <assertion>',
          (expect, subject) => {
            return expect.shift(`foo${subject}`);
          }
        );
      clonedExpect(
        'foo',
        'when prepended with foo',
        expect.it('to equal', 'foofoo')
      );
    });
  });

  it('should fail when the next argument is a non-expect.it function', () => {
    var clonedExpect = expect
      .clone()
      .addAssertion(
        '<string> when prepended with foo <assertion>',
        (expect, subject) => {
          return expect.shift(`foo${subject}`);
        }
      );
    expect(
      () => {
        clonedExpect('foo', 'when prepended with foo', () => {});
      },
      'to throw',
      "expected 'foo' when prepended with foo () => {}\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <string> when prepended with foo <function>\n' +
        '  did you mean:\n' +
        '    <string> when prepended with foo <assertion>'
    );
  });

  describe('with an async assertion', () => {
    it('should succeed', () => {
      return expect(42, 'when delayed a little bit', 'to be a number');
    });

    it('should fail with a diff', () => {
      return expect(
        expect(false, 'when delayed a little bit', 'to be a number'),
        'to be rejected with',
        'expected false when delayed a little bit to be a number'
      );
    });
  });

  describe('in legacy mode where the assertion index is passed as the second parameter', () => {
    it('should get the assertion string from that index', () => {
      var clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when prepended with <string> <assertion>',
          (expect, subject, value) => {
            return expect.shift(value + subject, 1);
          }
        );

      expect(
        () => {
          clonedExpect(
            'bar',
            'when prepended with',
            'foo',
            'to equal',
            'foobarquux'
          );
        },
        'to throw',
        "expected 'bar' when prepended with 'foo' to equal 'foobarquux'\n" +
          '\n' +
          '-foobar\n' +
          '+foobarquux'
      );
    });

    it('should render the correct error message when there is several non-string parameters following the assertion index', () => {
      var clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when prepended with foo <string> <number+>',
          (expect, subject) => {
            expect.shift(`foo${subject}`, 0);
            expect('abc', 'to equal', 'def');
          }
        );

      expect(
        () => {
          clonedExpect('bar', 'when prepended with foo', 'to equal', 123, 456);
        },
        'to throw',
        "expected 'bar' when prepended with foo to equal 123, 456"
      );
    });

    it('should render the correct error message when the assertion being shifted to is not a string', () => {
      var clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when prepended with foo <number+>',
          (expect, subject) => {
            expect.shift(`foo${subject}`, 0);
            expect('abc', 'to equal', 'def');
          }
        );

      expect(
        () => {
          clonedExpect('bar', 'when prepended with foo', 123, 456);
        },
        'to throw',
        "expected 'bar' when prepended with foo 123 456\n" +
          '\n' +
          '-abc\n' +
          '+def'
      );
    });

    it('should render the correct error message when there are no parameters following the assertion index', () => {
      var clonedExpect = expect
        .clone()
        .addAssertion('<string> when prepended with foo', (expect, subject) => {
          expect.shift(`foo${subject}`, 1);
          expect('abc', 'to equal', 'def');
        });

      expect(
        () => {
          clonedExpect('bar', 'when prepended with foo');
        },
        'to throw',
        "expected 'bar' when prepended with foo\n" + '\n' + '-abc\n' + '+def'
      );
    });
  });

  describe('when a non-Unexpected promise is passed to shift', () => {
    it('should allow a subsequent .and()', () => {
      var clonedExpect = expect
        .clone()
        .addAssertion('promisified', (expect, subject) => {
          return expect.shift(new Promise(subject));
        });
      return clonedExpect(resolve => {
        setTimeout(() => {
          resolve('usefully');
        }, 100);
      }, 'promisified').and('to be truthy');
    });

    it('should allow a subsequent .and() within a nested context', () => {
      var clonedExpect = expect
        .clone()
        .addAssertion('promisified', (expect, subject) => {
          return expect.shift(new Promise(subject));
        })
        .addAssertion(
          '<function> executed inside an assertion',
          (expect, subject) => {
            return subject(expect);
          }
        );

      return clonedExpect(expect => {
        expect(resolve => {
          setTimeout(() => {
            resolve('usefully');
          }, 100);
        }, 'promisified').and('to be truthy');
      }, 'executed inside an assertion');
    });
  });

  it('fails when the given assertion does not accept the shifted subject type', () => {
    var clonedExpect = expect
      .clone()
      .addAssertion(
        '<number> when stringified <assertion>',
        (expect, subject) => {
          expect.errorMode = 'nested';
          return expect.shift(String(subject));
        }
      );

    expect(
      () => {
        clonedExpect(666, 'when stringified', 'to be negative');
      },
      'to throw',
      'expected 666 when stringified to be negative\n' +
        "  expected '666' to be negative\n" +
        '    The assertion does not have a matching signature for:\n' +
        '      <string> to be negative\n' +
        '    did you mean:\n' +
        '      <number> [not] to be negative'
    );
  });

  describe('when you shift to an assertion in the parent expect', () => {
    it('fails when the given assertion does not accept the shifted subject type', () => {
      var clonedExpect = expect
        .clone()
        .child()
        .exportAssertion(
          '<number> when stringified <assertion>',
          (expect, subject) => {
            expect.errorMode = 'nested';
            return expect.shift(String(subject));
          }
        );

      expect(
        () => {
          clonedExpect(666, 'when stringified', 'to be negative');
        },
        'to throw',
        'expected 666 when stringified to be negative\n' +
          "  expected '666' to be negative\n" +
          '    The assertion does not have a matching signature for:\n' +
          '      <string> to be negative\n' +
          '    did you mean:\n' +
          '      <number> [not] to be negative'
      );
    });
  });
});
