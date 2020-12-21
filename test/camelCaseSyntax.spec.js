/* global expect */
describe('camel case syntax', () => {
  describe('with an assertion that is defined for the given subject type', () => {
    it('should succeed', () => {
      expect(456).toBeGreaterThan(123);
    });

    it('should fail', () => {
      expect(() => expect(123).toBeGreaterThan(456)).toThrow(
        'expected 123 to be greater than 456'
      );
    });

    describe('with a flag', () => {
      it('should succeed', () => {
        expect(123).notToBeGreaterThan(456);
      });

      it('should fail', () => {
        expect(() => expect(456).notToBeGreaterThan(123)).toThrow(
          'expected 456 not to be greater than 123'
        );
      });
    });
  });

  describe('within an assertion', () => {
    it('should succeed', () => {
      const clonedExpect = expect.clone();
      clonedExpect.addAssertion('<string> to foo', (expect, subject) =>
        expect(subject).toEqual('foo')
      );
      clonedExpect('foo').toFoo();
    });

    it('should fail', () => {
      const clonedExpect = expect.clone();
      clonedExpect.addAssertion('<string> to foo', (expect, subject) =>
        expect(subject).toEqual('foo')
      );
      expect(() => clonedExpect('bar').toFoo()).toThrow(
        "expected 'bar' to equal 'foo'\n" + '\n' + '-bar\n' + '+foo'
      );
    });
  });

  describe('in a clone', () => {
    it('should succeed', () => {
      expect.clone()(456).toBeGreaterThan(123);
    });

    it('should fail', () => {
      expect(() => expect.clone()(123).toBeGreaterThan(456)).toThrow(
        'expected 123 to be greater than 456'
      );
    });

    it('should not support an assertion subsequently added to the original expect', () => {
      const originalExpect = expect.clone();
      const clonedExpect = originalExpect.clone();
      originalExpect.addAssertion('<string> to foo', (expect, subject) =>
        expect(subject).toEqual('foo')
      );
      expect(clonedExpect('foo').toFoo).notToBeAFunction();
    });
  });

  describe('in a child', () => {
    it('should succeed', () => {
      expect.child()(456).toBeGreaterThan(123);
    });

    it('should fail', () => {
      expect(() => expect.child()(123).toBeGreaterThan(456)).toThrow(
        'expected 123 to be greater than 456'
      );
    });

    it('should support an assertion subsequently added to the parent', () => {
      const parentExpect = expect.clone();
      const childExpect = parentExpect.child();
      parentExpect.addAssertion('<string> to foo', (expect, subject) =>
        expect(subject).toEqual('foo')
      );
      childExpect('foo').toFoo();
    });
  });

  describe('with an assertion that is defined for the base of the given subject type', () => {
    it('should succeed', () => {
      function foo() {}
      foo.bar = 123;
      expect(foo).toHaveProperty('bar', 123);
    });

    it('should fail', () => {
      function foo() {}
      expect(() => expect(foo).toHaveProperty('bar', 123)).toThrow(
        "expected function foo() {} to have property 'bar', 123"
      );
    });
  });

  describe('with an assertion that is not defined for the given subject type', () => {
    it('should not expose a function', () => {
      expect(expect(123).toContain).toBeUndefined();
    });
  });

  describe('with a middle rocket assertion', () => {
    it('should succeed', () => {
      expect([1, 2, 3]).whenPassedAsParametersTo(Math.max).toEqual(3);
    });

    it('should fail', () => {
      expect(() =>
        expect([1, 2, 3]).whenPassedAsParametersTo(Math.max).toEqual(2)
      ).toThrow('expected 3 to equal 2');
    });
  });

  describe('with the expect.it equivalent', () => {
    it('should succeed', () => {
      expect({ foo: 123 }).toSatisfy({ foo: expect.toBeANumber() });
    });

    describe('and extra chaining with .and...', () => {
      it('should succeed', () => {
        expect({ foo: 123 }).toSatisfy({
          foo: expect.toBeANumber().andToBeGreaterThan(100),
        });
      });

      it('should fail', () => {
        expect(() =>
          expect({ foo: 123 }).toSatisfy({
            foo: expect.toBeANumber().andToBeGreaterThan(200),
          })
        ).toThrow(
          'expected { foo: 123 } to satisfy\n' +
            '{\n' +
            "  foo: expect.it('to be a number')\n" +
            "               .and('to be greater than', 200)\n" +
            '}\n' +
            '\n' +
            '{\n' +
            '  foo: 123 // ✓ should be a number and\n' +
            '           // ⨯ should be greater than 200\n' +
            '}'
        );
      });
    });

    describe('and extra chaining with .or...', () => {
      it('should succeed', () => {
        expect({ foo: 123 }).toSatisfy({
          foo: expect.toBeAString().orToBeGreaterThan(100),
        });
      });

      it('should fail', () => {
        expect(() =>
          expect({ foo: 123 }).toSatisfy({
            foo: expect.toBeAString().orToBeGreaterThan(200),
          })
        ).toThrow(
          'expected { foo: 123 } to satisfy\n' +
            '{\n' +
            "  foo: expect.it('to be a string')\n" +
            "             .or('to be greater than', 200)\n" +
            '}\n' +
            '\n' +
            '{\n' +
            '  foo: 123 // ⨯ should be a string or\n' +
            '           // ⨯ should be greater than 200\n' +
            '}'
        );
      });
    });

    it('should fail', () => {
      expect(() =>
        expect({ foo: 123 }).toSatisfy({ foo: expect.notToBeANumber() })
      ).toThrow(
        "expected { foo: 123 } to satisfy { foo: expect.it('not to be a number') }\n" +
          '\n' +
          '{\n' +
          '  foo: 123 // should not be a number\n' +
          '}'
      );
    });

    describe('in a child', () => {
      describe('with an assertion subsequently added to the parent', () => {
        it('should succeed', () => {
          const parentExpect = expect.clone();
          const childExpect = parentExpect.child();
          parentExpect.addAssertion('<string> to foo', (expect, subject) => {
            return expect(subject).toEqual('foo');
          });
          childExpect({ hey: 'foo' }).toSatisfy({ hey: childExpect.toFoo() });
        });

        it('should fail', () => {
          const parentExpect = expect.clone();
          const childExpect = parentExpect.child();
          parentExpect.addAssertion('<string> to foo', (expect, subject) =>
            expect(subject).toEqual('foo')
          );
          expect(() =>
            childExpect({ hey: 'bar' }).toSatisfy({ hey: childExpect.toFoo() })
          ).toThrow(
            "expected { hey: 'bar' } to satisfy { hey: expect.it('to foo') }\n" +
              '\n' +
              '{\n' +
              "  hey: 'bar' // should equal 'foo'\n" +
              '             //\n' +
              '             // -bar\n' +
              '             // +foo\n' +
              '}'
          );
        });
      });
    });
  });
});
