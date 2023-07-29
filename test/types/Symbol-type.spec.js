/* global expect */
// babel-polyfill's implementation of Symbol serializes very wonkily, so skip these tests when it's active:
if (
  typeof Symbol === 'function' &&
  Symbol('foo').toString() === 'Symbol(foo)'
) {
  describe('Symbol type', () => {
    const symbolA = Symbol('a');
    const anotherSymbolA = Symbol('a');
    const symbolB = Symbol('b');

    it('inspects correctly', () => {
      expect(symbolA, 'to inspect as', "Symbol('a')");
    });

    it('inspects correctly when used as a key in an object', () => {
      const obj = {};
      obj[symbolA] = 123;
      expect(obj, 'to inspect as', "{ [Symbol('a')]: 123 }");
    });

    describe('when compared for equality', () => {
      it('considers a symbol equal to itself', () => {
        expect(symbolA, 'to equal', symbolA);
      });

      it('considers two symbols with the same name different', () => {
        expect(symbolA, 'not to equal', anotherSymbolA);
      });

      it('does not render a diff', () => {
        expect(
          function () {
            expect(symbolA, 'to equal', symbolB);
          },
          'to throw',
          "expected Symbol('a') to equal Symbol('b')"
        );
      });

      it('should include Symbol properties in the "to equal" diff of objects', () => {
        const a = { foo: 123 };
        a[symbolA] = 'foo';
        a[symbolB] = 123;
        const b = { foo: 456 };
        b[symbolA] = 'bar';
        b[symbolB] = 123;
        expect(
          function () {
            expect(a, 'to equal', b);
          },
          'to throw',
          "expected { foo: 123, [Symbol('a')]: 'foo', [Symbol('b')]: 123 }\n" +
            "to equal { foo: 456, [Symbol('a')]: 'bar', [Symbol('b')]: 123 }\n" +
            '\n' +
            '{\n' +
            '  foo: 123, // should equal 456\n' +
            "  [Symbol('a')]: 'foo', // should equal 'bar'\n" +
            '                        //\n' +
            '                        // -foo\n' +
            '                        // +bar\n' +
            "  [Symbol('b')]: 123\n" +
            '}'
        );
      });
    });

    describe('with to satisfy', () => {
      it('satisfies itself', () => {
        expect(symbolA, 'to satisfy', symbolA);
      });

      it('does not satisfy another symbol, even with the same name', () => {
        expect(symbolA, 'not to satisfy', anotherSymbolA);
      });

      it('does not render a diff', () => {
        expect(
          function () {
            expect({ foo: symbolA }, 'to satisfy', { foo: anotherSymbolA });
          },
          'to throw',
          "expected { foo: Symbol('a') } to satisfy { foo: Symbol('a') }\n" +
            '\n' +
            '{\n' +
            "  foo: Symbol('a') // should equal Symbol('a')\n" +
            '}'
        );
      });

      it('should include the Symbol properties in the diff', () => {
        const a = { foo: 123 };
        a[symbolA] = 'foo';
        a[symbolB] = 123;
        const b = { foo: 456 };
        b[symbolA] = 'bar';
        b[symbolB] = 123;
        expect(
          function () {
            expect(a, 'to satisfy', b);
          },
          'to throw',
          "expected { foo: 123, [Symbol('a')]: 'foo', [Symbol('b')]: 123 }\n" +
            "to satisfy { foo: 456, [Symbol('a')]: 'bar', [Symbol('b')]: 123 }\n" +
            '\n' +
            '{\n' +
            '  foo: 123, // should equal 456\n' +
            "  [Symbol('a')]: 'foo', // should equal 'bar'\n" +
            '                        //\n' +
            '                        // -foo\n' +
            '                        // +bar\n' +
            "  [Symbol('b')]: 123\n" +
            '}'
        );
      });

      describe('when only symbol properties differ', function () {
        // Regression test for not looping over Object.getOwnPropertySymbols(obj)
        // in expect.promise.{any,all,settle} when an object is passed:
        it('should error and include the Symbol properties in the diff', () => {
          const a = {};
          a[symbolA] = 'foo';
          const b = {};
          b[symbolA] = 'bar';
          expect(
            function () {
              expect(a, 'to satisfy', b);
            },
            'to throw',
            "expected { [Symbol('a')]: 'foo' } to satisfy { [Symbol('a')]: 'bar' }\n" +
              '\n' +
              '{\n' +
              "  [Symbol('a')]: 'foo' // should equal 'bar'\n" +
              '                       //\n' +
              '                       // -foo\n' +
              '                       // +bar\n' +
              '}'
          );
        });
      });
    });
  });
}
