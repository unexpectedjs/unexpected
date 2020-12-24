/* global expect */
describe('expect.shift', () => {
  describe('when preserving the subject by passing no arguments', () => {
    it('should succeed', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> blabla <assertion>',
          function (expect, subject) {
            return expect.shift();
          }
        );
      clonedExpect('foo', 'blabla', 'to equal', 'foo');
    });

    it('should fail with a diff', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> blabla <assertion>',
          function (expect, subject) {
            return expect.shift();
          }
        );
      expect(function () {
        clonedExpect('foo', 'blabla', 'to equal', 'foobar');
      }).toThrow(
        "expected 'foo' blabla to equal 'foobar'\n" +
          '\n' +
          '-foo\n' +
          '+foobar'
      );
    });
  });

  it('should support calling shift multiple times', () => {
    const clonedExpect = expect
      .clone()
      .addAssertion(
        '<number> up to [and including] <number> <assertion>',
        function (expect, subject, value) {
          expect.errorMode = 'nested';
          const numbers = [];
          for (
            let i = subject;
            i < (expect.flags['and including'] ? value + 1 : value);
            i += 1
          ) {
            numbers.push(i);
          }
          return expect.promise.all(
            numbers.map(function (number) {
              return expect.promise(function () {
                return expect.shift(number);
              });
            })
          );
        }
      );

    return expect(function () {
      clonedExpect(5, 'up to and including', 100, 'to be within', 1, 90);
    }).toError(
      'expected 5 up to and including 100 to be within 1, 90\n' +
        '  expected 91 to be within 1..90'
    );
  });

  describe('when substituting a different subject by passing a single argument', () => {
    it('should succeed', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when appended with bar <assertion>',
          function (expect, subject) {
            return expect.shift(`${subject}bar`);
          }
        );
      clonedExpect('foo', 'when appended with bar', 'to equal', 'foobar');
    });

    it('should fail with a diff', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when appended with bar <assertion>',
          function (expect, subject) {
            return expect.shift(`${subject}bar`);
          }
        );
      expect(function () {
        clonedExpect('crow', 'when appended with bar', 'to equal', 'foobar');
      }).toThrow(
        "expected 'crow' when appended with bar to equal 'foobar'\n" +
          '\n' +
          '-crowbar\n' +
          '+foobar'
      );
    });
  });

  it('should identify the assertions even when the next assertion fails before shifting', () => {
    const clonedExpect = expect
      .clone()
      .addAssertion(
        '<string> when appended with bar <assertion>',
        function (expect, subject) {
          if (subject === 'crow') {
            expect.fail();
          }
          return expect.shift(`${subject}bar`);
        }
      );
    expect(function () {
      clonedExpect(
        'crow',
        'when appended with bar',
        'when appended with bar',
        'to equal',
        'foobarbar'
      );
    }).toThrow(
      "expected 'crow' when appended with bar when appended with bar to equal 'foobarbar'"
    );
  });

  it('supports the legacy 3 argument version', () => {
    const clonedExpect = expect
      .clone()
      .addAssertion(
        '<string> when prepended with foo <assertion>',
        function (expect, subject) {
          return expect.shift(expect, `foo${subject}`, 0);
        }
      );
    clonedExpect('foo', 'when prepended with foo', expect.toEqual('foofoo'));
  });

  describe('with the legacy 2 argument version', () => {
    it('inspects multiple arguments correctly', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when surrounded by <string> <string> <assertion>',
          function (expect, subject) {
            return expect.shift(`foo${subject}`, 2);
          }
        );

      return expect(function () {
        clonedExpect(
          'bar',
          'when surrounded by',
          'foo',
          'quux',
          'to be a number'
        );
      }).toThrow(
        "expected 'bar' when surrounded by 'foo', 'quux' to be a number"
      );
    });
  });

  describe('with an expect.it function as the next argument', () => {
    it('should succeed', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when prepended with foo <assertion>',
          function (expect, subject) {
            return expect.shift(`foo${subject}`);
          }
        );
      clonedExpect('foo', 'when prepended with foo', expect.toEqual('foofoo'));
    });
  });

  it('should fail when the next argument is a non-expect.it function', () => {
    const clonedExpect = expect
      .clone()
      .addAssertion(
        '<string> when prepended with foo <assertion>',
        function (expect, subject) {
          return expect.shift(`foo${subject}`);
        }
      );
    expect(function () {
      clonedExpect('foo', 'when prepended with foo', function () {});
    }).toThrow(
      "expected 'foo' when prepended with foo function () {}\n" +
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
        expect(false, 'when delayed a little bit', 'to be a number')
      ).toBeRejectedWith(
        'expected false when delayed a little bit to be a number'
      );
    });
  });

  describe('in legacy mode where the assertion index is passed as the second parameter', () => {
    it('should get the assertion string from that index', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when prepended with <string> <assertion>',
          function (expect, subject, value) {
            return expect.shift(value + subject, 1);
          }
        );

      expect(function () {
        clonedExpect(
          'bar',
          'when prepended with',
          'foo',
          'to equal',
          'foobarquux'
        );
      }).toThrow(
        "expected 'bar' when prepended with 'foo' to equal 'foobarquux'\n" +
          '\n' +
          '-foobar\n' +
          '+foobarquux'
      );
    });

    it('should render the correct error message when there is several non-string parameters following the assertion index', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when prepended with foo <string> <number+>',
          function (expect, subject) {
            expect.shift(`foo${subject}`, 0);
            expect('abc').toEqual('def');
          }
        );

      expect(function () {
        clonedExpect('bar', 'when prepended with foo', 'to equal', 123, 456);
      }).toThrow("expected 'bar' when prepended with foo to equal 123, 456");
    });

    it('should render the correct error message when the assertion being shifted to is not a string', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when prepended with foo <number+>',
          function (expect, subject) {
            expect.shift(`foo${subject}`, 0);
            expect('abc').toEqual('def');
          }
        );

      expect(function () {
        clonedExpect('bar', 'when prepended with foo', 123, 456);
      }).toThrow(
        "expected 'bar' when prepended with foo 123 456\n" +
          '\n' +
          '-abc\n' +
          '+def'
      );
    });

    it('should render the correct error message when there are no parameters following the assertion index', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion(
          '<string> when prepended with foo',
          function (expect, subject) {
            expect.shift(`foo${subject}`, 1);
            expect('abc').toEqual('def');
          }
        );

      expect(function () {
        clonedExpect('bar', 'when prepended with foo');
      }).toThrow(
        "expected 'bar' when prepended with foo\n" + '\n' + '-abc\n' + '+def'
      );
    });
  });

  describe('when a non-Unexpected promise is passed to shift', () => {
    it('should allow a subsequent .and()', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion('<any> promisified', function (expect, subject) {
          return expect.shift(new Promise(subject));
        });
      return clonedExpect((resolve) => {
        setTimeout(function () {
          resolve('usefully');
        }, 100);
      }, 'promisified').and('to be truthy');
    });

    it('should allow a subsequent .and() within a nested context', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion('<any> promisified', function (expect, subject) {
          return expect.shift(new Promise(subject));
        })
        .addAssertion(
          '<function> executed inside an assertion',
          function (expect, subject) {
            return subject(expect);
          }
        );

      return clonedExpect((expect) => {
        expect((resolve) => {
          setTimeout(function () {
            resolve('usefully');
          }, 100);
        }, 'promisified').and('to be truthy');
      }, 'executed inside an assertion');
    });
  });

  it('fails when the given assertion does not accept the shifted subject type', () => {
    const clonedExpect = expect
      .clone()
      .addAssertion(
        '<number> when stringified <assertion>',
        function (expect, subject) {
          expect.errorMode = 'nested';
          return expect.shift(String(subject));
        }
      );

    expect(() => {
      clonedExpect(666, 'when stringified', 'to be negative');
    }).toThrow(
      'expected 666 when stringified to be negative\n' +
        "  expected '666' to be negative\n" +
        '    The assertion does not have a matching signature for:\n' +
        '      <string> to be negative\n' +
        '    did you mean:\n' +
        '      <BigInt> [not] to be negative\n' +
        '      <number> [not] to be negative'
    );
  });

  describe('when you shift to an assertion in the parent expect', () => {
    it('fails when the given assertion does not accept the shifted subject type', () => {
      const clonedExpect = expect
        .clone()
        .child()
        .exportAssertion(
          '<number> when stringified <assertion>',
          function (expect, subject) {
            expect.errorMode = 'nested';
            return expect.shift(String(subject));
          }
        );

      expect(() => {
        clonedExpect(666, 'when stringified', 'to be negative');
      }).toThrow(
        'expected 666 when stringified to be negative\n' +
          "  expected '666' to be negative\n" +
          '    The assertion does not have a matching signature for:\n' +
          '      <string> to be negative\n' +
          '    did you mean:\n' +
          '      <BigInt> [not] to be negative\n' +
          '      <number> [not] to be negative'
      );
    });
  });
});
