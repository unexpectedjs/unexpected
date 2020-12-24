/* global expect */
describe('expect.it', () => {
  it('returns an expectation function that when applied runs the assertion on the given subject', () => {
    const expectation = expect.toBeGreaterThan(14);
    expectation(20);
    expect(function () {
      expectation(10);
    }).toThrow('expected 10 to be greater than 14');
  });

  it('is inspected as it is written', () => {
    const expectation = expect
      .toBeANumber()
      .and('to be less than', 14)
      .and('to be negative')
      .or('to be a string')
      .and('to have length', 6);
    expect(expect.inspect(expectation).toString()).toEqual(
      "expect.it('to be a number')\n" +
        "        .and('to be less than', 14)\n" +
        "        .and('to be negative')\n" +
        "      .or('to be a string')\n" +
        "        .and('to have length', 6)"
    );
  });

  it('does not catch errors that are not thrown by unexpected', () => {
    const clonedExpect = expect
      .clone()
      .addAssertion('<any> explode', function (expect, subject) {
        throw new Error('Explosion');
      });

    expect(clonedExpect.it('explode')).toThrow('Explosion');
  });

  describe('with chained and', () => {
    it('all assertions has to be satisfied', () => {
      const expectation = expect
        .toBeANumber()
        .and('to be less than', 14)
        .and('to be negative');
      expect(function () {
        expectation(20);
      }).toThrow(
        '✓ expected 20 to be a number and\n' +
          '⨯ expected 20 to be less than 14 and\n' +
          '⨯ expected 20 to be negative'
      );
    });

    it('returns a new function', () => {
      const expectation = expect.toBeANumber();
      const compositeExpectation = expectation.and('to be less than', 14);
      expect(compositeExpectation).notToBe(expectation);

      expectation(20);
      expect(function () {
        compositeExpectation(20);
      }).toThrow(
        '✓ expected 20 to be a number and\n' +
          '⨯ expected 20 to be less than 14'
      );
    });

    it('outputs one failing assertion correctly', () => {
      const expectation = expect
        .toBeANumber()
        .and('to be less than', 14)
        .and('to be negative');
      expect(function () {
        expectation(8);
      }).toThrow(
        '✓ expected 8 to be a number and\n' +
          '✓ expected 8 to be less than 14 and\n' +
          '⨯ expected 8 to be negative'
      );
    });
  });

  describe('with chained or', () => {
    it('succeeds if any expectations succeeds', () => {
      const expectation = expect
        .toBeANumber()
        .or('to be a string')
        .or('to be an array');
      expect(function () {
        expectation('success');
      }).notToThrow();
    });

    it('fails if all the expectations fails', () => {
      const expectation = expect
        .toBeANumber()
        .and('to be greater than', 6)
        .or('to be a string')
        .and('to have length', 6)
        .or('to be an array');
      expect(function () {
        expectation('foobarbaz');
      }).toThrow(
        "⨯ expected 'foobarbaz' to be a number and\n" +
          "⨯ expected 'foobarbaz' to be greater than 6\n" +
          'or\n' +
          "✓ expected 'foobarbaz' to be a string and\n" +
          "⨯ expected 'foobarbaz' to have length 6\n" +
          '    expected 9 to be 6\n' +
          'or\n' +
          "⨯ expected 'foobarbaz' to be an array"
      );
    });

    it('if there are no and-clauses it writes the failure output more compactly', () => {
      const expectation = expect
        .toBeANumber()
        .or('to be a string')
        .or('to be an array');
      expect(function () {
        expectation(true);
      }).toThrow(
        '⨯ expected true to be a number or\n' +
          '⨯ expected true to be a string or\n' +
          '⨯ expected true to be an array'
      );
    });

    it('returns a new function', () => {
      const expectation = expect.toBeANumber();
      const compositeExpectation = expectation.or('to be a string');
      expect(compositeExpectation).notToBe(expectation);

      expectation(20);
      expect(function () {
        compositeExpectation(20);
        compositeExpectation(true);
      }).toThrow(
        '⨯ expected true to be a number or\n' + '⨯ expected true to be a string'
      );
    });
  });

  describe('with async assertions', () => {
    const clonedExpect = expect
      .clone()
      .addAssertion(
        '<any> to be a number after a short delay',
        function (expect, subject) {
          expect.errorMode = 'nested';

          return expect.promise(function (run) {
            setTimeout(
              run(function () {
                expect(subject).toBeANumber();
              }),
              1
            );
          });
        }
      )
      .addAssertion(
        '<any> to be finite after a short delay',
        function (expect, subject) {
          expect.errorMode = 'nested';

          return expect.promise(function (run) {
            setTimeout(
              run(function () {
                expect(subject).toBeFinite();
              }),
              1
            );
          });
        }
      )
      .addAssertion(
        '<any> to be a string after a short delay',
        function (expect, subject) {
          expect.errorMode = 'nested';

          return expect.promise(function (run) {
            setTimeout(
              run(function () {
                expect(subject).toBeAString();
              }),
              1
            );
          });
        }
      );

    it('should succeed', () => {
      return clonedExpect.it('to be a number after a short delay')(123);
    });

    it('should fail with a diff', () => {
      return expect(
        clonedExpect.it('to be a number after a short delay')(false)
      ).toBeRejectedWith(
        'expected false to be a number after a short delay\n' +
          '  expected false to be a number'
      );
    });

    describe('with a chained "and" construct', () => {
      it('should succeed', () => {
        return clonedExpect
          .it('to be a number after a short delay')
          .and('to be finite after a short delay')(123);
      });

      it('should fail with a diff', () => {
        return expect(
          clonedExpect
            .it('to be a number after a short delay')
            .and('to be finite after a short delay')(false)
        ).toBeRejectedWith(
          '⨯ expected false to be a number after a short delay and\n' +
            '    expected false to be a number\n' +
            '⨯ expected false to be finite after a short delay'
        );
      });
    });

    describe('with a chained "or" construct', () => {
      it('should succeed', () => {
        return clonedExpect
          .it('to be a number after a short delay')
          .and('to be finite after a short delay')
          .or('to be a string after a short delay')('abc');
      });

      it('should fail with a diff', () => {
        return expect(
          clonedExpect
            .it('to be a number after a short delay')
            .and('to be finite after a short delay')
            .or('to be a string after a short delay')(false)
        ).toBeRejectedWith(
          '⨯ expected false to be a number after a short delay and\n' +
            '    expected false to be a number\n' +
            '⨯ expected false to be finite after a short delay\n' +
            'or\n' +
            '⨯ expected false to be a string after a short delay\n' +
            '    expected false to be a string'
        );
      });
    });
  });

  it('should not swallow a "missing assertion" error when using an expect.it(...).or(...) construct', () => {
    expect(function () {
      expect('foo').toSatisfy(
        expect.it('this is misspelled', 1).or('to be a string')
      );
    }).toThrow(
      "expected 'foo' to satisfy\n" +
        "expect.it('this is misspelled', 1)\n" +
        "      .or('to be a string')\n" +
        '\n' +
        "Unknown assertion 'this is misspelled', did you mean: 'to be fulfilled'"
    );
  });

  it('should fail with a "missing assertion" error even when it is not the first failing one in an "and" group', () => {
    expect(function () {
      expect('foo').toSatisfy(
        expect.toBeginWith('bar').and('misspelled').or('to be a string')
      );
    }).toThrow(
      "expected 'foo' to satisfy\n" +
        "expect.it('to begin with', 'bar')\n" +
        "        .and('misspelled')\n" +
        "      .or('to be a string')\n" +
        '\n' +
        "Unknown assertion 'misspelled', did you mean: 'called'"
    );
  });

  it('should not fail when the first clause in an or group specifies an assertion that is not defined for the given arguments', () => {
    expect([false, 'foo', 'bar']).toHaveItemsSatisfying(
      expect.toBeFalse().or('to be a string')
    );
  });

  describe('with forwarding of flags', () => {
    describe('directly', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion(
          '<object> [not] to have a foo property of bar',
          function (expect, subject) {
            return expect(subject).toSatisfy({
              foo: expect.it('[not] to equal', 'bar'),
            });
          }
        );

      describe('when the flag is not being forwarded', () => {
        it('should succeed', () => {
          clonedExpect({ foo: 'bar' }, 'to have a foo property of bar');
        });

        it('should fail with a diff', () => {
          return expect(function () {
            clonedExpect({ quux: 123 }, 'to have a foo property of bar');
          }).toThrow(
            'expected { quux: 123 } to have a foo property of bar\n' +
              '\n' +
              '{\n' +
              '  quux: 123\n' +
              "  // missing: foo: should equal 'bar'\n" +
              '}'
          );
        });
      });

      describe('when the flag is being forwarded', () => {
        it('should succeed', () => {
          clonedExpect({ quux: 123 }, 'not to have a foo property of bar');
        });

        it('should fail with a diff', () => {
          return expect(function () {
            clonedExpect({ foo: 'bar' }, 'not to have a foo property of bar');
          }).toThrow(
            "expected { foo: 'bar' } not to have a foo property of bar\n" +
              '\n' +
              '{\n' +
              "  foo: 'bar' // should not equal 'bar'\n" +
              '}'
          );
        });
      });
    });

    describe('through an <assertion> being shifted to', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion(
          '<object> [not] to have a foo property of bar',
          function (expect, subject) {
            return expect(subject).toSatisfy({
              foo: expect.it('noop', '[not] to equal', 'bar'),
            });
          }
        )
        .addAssertion('<any> noop <assertion>', (expect) => expect.shift());

      describe('when the flag is not being forwarded', () => {
        it('should succeed', () => {
          clonedExpect({ foo: 'bar' }, 'to have a foo property of bar');
        });

        it('should fail with a diff', () => {
          return expect(function () {
            clonedExpect({ quux: 123 }, 'to have a foo property of bar');
          }).toThrow(
            'expected { quux: 123 } to have a foo property of bar\n' +
              '\n' +
              '{\n' +
              '  quux: 123\n' +
              "  // missing: foo: expected: noop to equal 'bar'\n" +
              '}'
          );
        });
      });

      describe('when the flag is being forwarded', () => {
        it('should succeed', () => {
          clonedExpect({ quux: 123 }, 'not to have a foo property of bar');
        });

        it('should fail with a diff', () => {
          return expect(function () {
            clonedExpect({ foo: 'bar' }, 'not to have a foo property of bar');
          }).toThrow(
            "expected { foo: 'bar' } not to have a foo property of bar\n" +
              '\n' +
              '{\n' +
              "  foo: 'bar' // expected: noop not to equal 'bar'\n" +
              '}'
          );
        });
      });
    });
  });

  describe('when passed a function', () => {
    it('should succeed', () => {
      expect.it((value) => {
        expect(value).toEqual('foo');
      })('foo');
    });

    it('should fail with a diff', () => {
      expect(() => {
        expect.it(function (value) {
          expect(value).toEqual('bar');
        })('foo');
      }).toThrow("expected 'foo' to equal 'bar'\n" + '\n' + '-foo\n' + '+bar');
    });

    it('supports returning a promise from the function', () => {
      return expect(() =>
        expect.it((value) =>
          expect.promise((run) => {
            setTimeout(run(() => expect(value).toEqual('bar')));
          })
        )('foo')
      ).toBeRejectedWith(
        "expected 'foo' to equal 'bar'\n" + '\n' + '-foo\n' + '+bar'
      );
    });

    it('should fail when passed more than two arguments', () => {
      expect(() => {
        expect.it(function (value) {
          expect(value).toEqual('bar');
        }, 'yadda')('foo');
      }).toThrow('expect.it(<function>) does not accept additional arguments');
    });

    describe('and chained the expression is chained', () => {
      describe('and the first expression is a function', () => {
        it('fails with a diff including all items in the chain', () => {
          expect(() => {
            expect
              .it(function (value) {
                expect(value).toEqual('bar');
              })
              .and('to be a string')('foo');
          }).toThrow(
            "⨯ expected 'foo' to equal 'bar' and\n" +
              '\n' +
              '  -foo\n' +
              '  +bar\n' +
              "✓ expected 'foo' to be a string"
          );
        });
      });

      describe('and the second expression is a function', () => {
        it('fails with a diff including all items in the chain', () => {
          expect(() => {
            expect.toBeAString().and(function (value) {
              expect(value).toEqual('bar');
            })('foo');
          }).toThrow(
            "✓ expected 'foo' to be a string and\n" +
              "⨯ expected 'foo' to equal 'bar'\n" +
              '\n' +
              '  -foo\n' +
              '  +bar'
          );
        });
      });
    });
  });
});
