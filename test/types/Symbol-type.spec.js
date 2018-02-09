/*global expect, Symbol*/
// babel-polyfill's implementation of Symbol serializes very wonkily, so skip these tests when it's active:
if (
  typeof Symbol === 'function' &&
  Symbol('foo').toString() === 'Symbol(foo)'
) {
  describe('Symbol type', function() {
    var symbolA = Symbol('a');
    var anotherSymbolA = Symbol('a');
    var symbolB = Symbol('b');

    it('inspects correctly', function() {
      expect(symbolA, 'to inspect as', "Symbol('a')");
    });

    it('inspects correctly when used as a key in an object', function() {
      var obj = {};
      obj[symbolA] = 123;
      expect(obj, 'to inspect as', "{ [Symbol('a')]: 123 }");
    });

    describe('when compared for equality', function() {
      it('considers a symbol equal to itself', function() {
        expect(symbolA, 'to equal', symbolA);
      });

      it('considers two symbols with the same name different', function() {
        expect(symbolA, 'not to equal', anotherSymbolA);
      });

      it('does not render a diff', function() {
        expect(
          function() {
            expect(symbolA, 'to equal', symbolB);
          },
          'to throw',
          "expected Symbol('a') to equal Symbol('b')"
        );
      });

      it('should include Symbol properties in the "to equal" diff of objects', function() {
        var a = { foo: 123 };
        a[symbolA] = 'foo';
        a[symbolB] = 123;
        var b = { foo: 456 };
        b[symbolA] = 'bar';
        b[symbolB] = 123;
        expect(
          function() {
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

    describe('with to satisfy', function() {
      it('satisfies itself', function() {
        expect(symbolA, 'to satisfy', symbolA);
      });

      it('does not satisfy another symbol, even with the same name', function() {
        expect(symbolA, 'not to satisfy', anotherSymbolA);
      });

      it('does not render a diff', function() {
        expect(
          function() {
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

      it('should include the Symbol properties in the diff', function() {
        var a = { foo: 123 };
        a[symbolA] = 'foo';
        a[symbolB] = 123;
        var b = { foo: 456 };
        b[symbolA] = 'bar';
        b[symbolB] = 123;
        expect(
          function() {
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
    });
  });
}
