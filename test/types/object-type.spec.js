/* global expect */
describe('object type', () => {
  describe('#diff', () => {
    it('should show identical multiline values correctly in diffs', () => {
      const clonedExpect = expect.clone().addType({
        name: 'numberNine',
        identify(obj) {
          return obj === 9;
        },
        inspect(value, depth, output) {
          output.block(function () {
            this.text('NUMBER').nl().text(' NINE ');
          });
        },
      });
      expect(function () {
        clonedExpect({ a: 123, b: 9 }).toEqual({ a: 456, b: 9 });
      }).toThrow(
        'expected\n' +
          '{\n' +
          '  a: 123,\n' +
          '  b: NUMBER\n' +
          '      NINE \n' +
          '}\n' +
          'to equal\n' +
          '{\n' +
          '  a: 456,\n' +
          '  b: NUMBER\n' +
          '      NINE \n' +
          '}\n' +
          '\n' +
          '{\n' +
          '  a: 123, // should equal 456\n' +
          '  b: NUMBER\n' +
          '      NINE \n' +
          '}'
      );
    });
  });

  describe('#equal', () => {
    it('should ignore undefined properties on the LHS', () => {
      expect(function () {
        expect({ lhs: undefined }).toEqual({});
      }).notToThrow();
    });

    it('should ignore undefined properties on the RHS', () => {
      expect(function () {
        expect({}).toEqual({ rhs: undefined });
      }).notToThrow();
    });

    describe('with a subtype that overrides valueForKey()', () => {
      const clonedExpect = expect.clone();

      clonedExpect.addType({
        name: 'undefinerObject',
        base: 'object',
        identify: function (obj) {
          return obj && typeof 'object' && obj.xuuq;
        },
        valueForKey: function (obj, key) {
          if (key !== 'xuuq') {
            return undefined;
          }
          return obj[key];
        },
      });

      it('should ignore undefined properties on the LHS', () => {
        expect(function () {
          expect({ xuuq: true, lhs: undefined }).toEqual({ xuuq: true });
        }).notToThrow();
      });

      it('should ignore undefined properties on the RHS', () => {
        expect(function () {
          expect({ xuuq: true }).toEqual({ xuuq: true, rhs: undefined });
        }).notToThrow();
      });
    });
  });

  describe('#getKeys', () => {
    const clonedExpect = expect.clone();

    clonedExpect.addType({
      name: 'fooObject',
      base: 'object',
      identify: function (obj) {
        return obj && typeof 'object' && obj.foo;
      },
      getKeys: function (obj) {
        return Object.keys(obj).filter(function (key) {
          return key[0] !== '_';
        });
      },
    });

    it('should restrict the compared properties', () => {
      expect(function () {
        clonedExpect({ foo: true, _bar: true }).toEqual({
          foo: true,
          _bar: false,
        });
      }).notToThrow();
    });
  });

  describe('#similar', () => {
    const clonedExpect = expect.clone();

    clonedExpect.addType({
      name: 'ignoreUnderscoresObject',
      base: 'object',
      identify(obj) {
        return obj && typeof 'object' && obj.xuuq;
      },
      valueForKey(obj, key) {
        if (key[0] === '_') {
          return undefined;
        }
        return obj[key];
      },
    });

    it('should pass with values overriding valueForKey()', () => {
      expect(function () {
        clonedExpect([
          { xuuq: true, quux: 'foo', _bob: true },
          'foobar',
        ]).toEqual([{ xuuq: true, quux: 'foo', _bob: false }, 'foobar']);
      }).notToThrow();
    });

    it('should fail with values overriding valueForKey()', () => {
      expect(function () {
        clonedExpect([
          { xuuq: true, quux: 'bar', _bob: true },
          'foobar',
        ]).toEqual(['foobar', { xuuq: true, quux: 'baz', _bob: false }]);
      }).toThrow(
        "expected [ { xuuq: true, quux: 'bar', _bob: undefined }, 'foobar' ]\n" +
          "to equal [ 'foobar', { xuuq: true, quux: 'baz', _bob: undefined } ]\n" +
          '\n' +
          '[\n' +
          '┌─▷\n' +
          '│   {\n' +
          '│     xuuq: true,\n' +
          "│     quux: 'bar', // should equal 'baz'\n" +
          '│                  //\n' +
          '│                  // -bar\n' +
          '│                  // +baz\n' +
          '│     _bob: undefined\n' +
          '│   },\n' +
          "└── 'foobar' // should be moved\n" +
          ']'
      );
    });
  });

  describe('with a subtype that disables indentation', () => {
    const clonedExpect = expect.clone();

    clonedExpect.addType({
      base: 'object',
      name: 'bogusobject',
      identify(obj) {
        return obj && typeof obj === 'object' && !Array.isArray(obj);
      },
      indent: false,
    });

    it('should not render the indentation when an instance is inspected in a multi-line context', () => {
      expect(
        clonedExpect
          .inspect({
            a:
              'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            b:
              'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          })
          .toString()
      ).toEqual(
        '{\n' +
          "a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" +
          "b: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'\n" +
          '}'
      );
    });

    it('should not render the indentation when an instance is diffed', () => {
      expect(
        clonedExpect.diff({ a: 'a', b: 'b' }, { a: 'aa', b: 'bb' }).toString()
      ).toEqual(
        '{\n' +
          "a: 'a', // should equal 'aa'\n" +
          '        //\n' +
          '        // -a\n' +
          '        // +aa\n' +
          "b: 'b' // should equal 'bb'\n" +
          '       //\n' +
          '       // -b\n' +
          '       // +bb\n' +
          '}'
      );
    });

    it('should not render the indentation when an instance participates in a "to satisfy" diff', () => {
      expect(function () {
        clonedExpect({ a: 'aaa', b: 'bbb' }).toSatisfy({ a: 'foo' });
      }).toThrow(
        "expected { a: 'aaa', b: 'bbb' } to satisfy { a: 'foo' }\n" +
          '\n' +
          '{\n' +
          "a: 'aaa', // should equal 'foo'\n" +
          '          //\n' +
          '          // -aaa\n' +
          '          // +foo\n' +
          "b: 'bbb'\n" +
          '}'
      );
    });
  });

  describe('with a subtype that renders an empty prefix and an empty suffix', () => {
    const clonedExpect = expect.clone();

    clonedExpect.addType({
      base: 'object',
      name: 'bogusobject',
      identify(obj) {
        return obj && typeof obj === 'object' && !Array.isArray(obj);
      },
      prefix(output) {
        return output;
      },
      suffix(output) {
        return output;
      },
    });

    it('should not render the prefix, suffix, and the newlines when an instance is inspected in a multi-line context', () => {
      expect(
        clonedExpect
          .inspect({
            a:
              'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            b:
              'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          })
          .toString()
      ).toEqual(
        "  a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" +
          "  b: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'"
      );
    });

    it('should not render the prefix, suffix, and the newlines when an instance is diffed', () => {
      expect(
        clonedExpect.diff({ a: 'a', b: 'b' }, { a: 'aa', b: 'bb' }).toString()
      ).toEqual(
        "  a: 'a', // should equal 'aa'\n" +
          '          //\n' +
          '          // -a\n' +
          '          // +aa\n' +
          "  b: 'b' // should equal 'bb'\n" +
          '         //\n' +
          '         // -b\n' +
          '         // +bb'
      );
    });

    it('should not render the prefix, suffix, and the newlines when an instance participates in a "to satisfy" diff', () => {
      expect(function () {
        clonedExpect({ a: 'aaa', b: 'bbb' }).toSatisfy({ a: 'foo' });
      }).toThrow(
        "expected a: 'aaa', b: 'bbb' to satisfy a: 'foo'\n" +
          '\n' +
          "  a: 'aaa', // should equal 'foo'\n" +
          '            //\n' +
          '            // -aaa\n' +
          '            // +foo\n' +
          "  b: 'bbb'"
      );
    });
  });

  describe('with a subtype that forces forceMultipleLines mode', () => {
    const clonedExpect = expect.clone();

    clonedExpect.addType({
      base: 'object',
      name: 'bogusobject',
      identify(obj) {
        return obj && typeof obj === 'object' && !Array.isArray(obj);
      },
      forceMultipleLines: true,
    });

    it('should inspect in forceMultipleLines mode despite being able to render on one line', () => {
      expect(clonedExpect.inspect({ a: 'a', b: 'b' }).toString()).toEqual(
        '{\n' +
          "  a: 'a', b: 'b'\n" + // This is the 'compact' feature kicking in
          '}'
      );
    });
  });

  describe('with a subtype that overrides property()', () => {
    it('should render correctly in both inspection and diff', () => {
      const clonedExpect = expect.clone();

      clonedExpect.addStyle('xuuqProperty', function (key, inspectedValue) {
        this.text('<')
          .appendInspected(key)
          .text('> --> ')
          .append(inspectedValue);
      });

      clonedExpect.addType({
        name: 'xuuq',
        base: 'object',
        identify: function (obj) {
          return obj && typeof 'object' && obj.quux === 'xuuq';
        },
        property: function (output, key, inspectedValue) {
          return output.xuuqProperty(key, inspectedValue);
        },
      });

      expect(function () {
        clonedExpect({ quux: 'xuuq', foobar: 'faz' }).toEqual({
          quux: 'xuuq',
          foobar: 'baz',
        });
      }).toThrow(
        "expected { <'quux'> --> 'xuuq', <'foobar'> --> 'faz' }\n" +
          "to equal { <'quux'> --> 'xuuq', <'foobar'> --> 'baz' }\n" +
          '\n' +
          '{\n' +
          "  <'quux'> --> 'xuuq',\n" +
          "  <'foobar'> --> 'faz' // should equal 'baz'\n" +
          '                       //\n' +
          '                       // -faz\n' +
          '                       // +baz\n' +
          '}'
      );
    });
  });

  describe('with a subtype that overrides valueForKey()', () => {
    const clonedExpect = expect.clone();

    clonedExpect.addType({
      name: 'nineObject',
      base: 'object',
      identify: function (obj) {
        return obj && typeof 'object' && obj.nine === 9;
      },
      valueForKey: function (obj, key) {
        if (key === 'oof') {
          return;
        }
        if (typeof obj[key] === 'string') {
          return obj[key].toUpperCase();
        }
        return obj[key];
      },
    });

    it('should process properties in both inspection and diff in "to equal"', () => {
      expect(function () {
        clonedExpect({ nine: 9, zero: 1, foo: 'bAr' }).toEqual({
          nine: 9,
          zero: 0,
          foo: 'BaR',
        });
      }).toThrow(
        "expected { nine: 9, zero: 1, foo: 'BAR' } to equal { nine: 9, zero: 0, foo: 'BAR' }\n" +
          '\n' +
          '{\n' +
          '  nine: 9,\n' +
          '  zero: 1, // should equal 0\n' +
          "  foo: 'BAR'\n" +
          '}'
      );
    });

    it('should process properties in both inspection and diff in "to satisfy"', () => {
      expect(function () {
        clonedExpect({
          nine: 9,
          zero: 1,
          foo: 'bAr',
          baz: undefined,
        }).toSatisfy({
          nine: 9,
          zero: 0,
          foo: 'BaR',
          baz: expect.toBeUndefined(),
        });
      }).toThrow(
        "expected { nine: 9, zero: 1, foo: 'BAR', baz: undefined }\n" +
          "to satisfy { nine: 9, zero: 0, foo: 'BAR', baz: expect.it('to be undefined') }\n" +
          '\n' +
          '{\n' +
          '  nine: 9,\n' +
          '  zero: 1, // should equal 0\n' +
          "  foo: 'BAR',\n" +
          '  baz: undefined\n' +
          '}'
      );
    });

    (Object.setPrototypeOf ? it : it.skip)(
      'should process keys from the prototype chain in "to exhaustively satisfy"',
      function () {
        const fooObject = {
          foo: 'bAr',
          oof: 'should not appear',
        };
        const chainedObject = { nine: 9, baz: undefined };
        Object.setPrototypeOf(chainedObject, fooObject);

        expect(function () {
          clonedExpect(chainedObject).toExhaustivelySatisfy({
            nine: 9,
            foo: 'BaZ',
            baz: expect.toBeUndefined(),
          });
        }).toThrow(
          'expected { nine: 9, baz: undefined }\n' +
            "to exhaustively satisfy { nine: 9, foo: 'BAZ', baz: expect.it('to be undefined') }\n" +
            '\n' +
            '{\n' +
            '  nine: 9,\n' +
            '  baz: undefined\n' +
            "  foo: 'BAR' // should equal 'BAZ'\n" +
            '             //\n' +
            '             // -BAR\n' +
            '             // +BAZ\n' +
            '}'
        );
      }
    );
  });

  describe('with a subtype that key presence and retrieval', () => {
    function NestedObject(contentObject) {
      this.contentObject = contentObject;
    }

    const clonedExpect = expect.clone();

    clonedExpect.addType({
      name: 'NestedObject',
      base: 'object',
      identify: function (obj) {
        return obj && obj instanceof NestedObject;
      },
      getKeys: function (obj) {
        return Object.keys(obj.contentObject);
      },
      hasKey: function (obj, key) {
        return obj.contentObject[key];
      },
      valueForKey: function (obj, key) {
        return obj.contentObject[key];
      },
    });

    it('should mark keys missing', () => {
      expect(function () {
        clonedExpect(new NestedObject({})).toEqual(
          new NestedObject({ foo: 'bar' })
        );
      }).toThrow(
        "expected NestedObject({}) to equal NestedObject({ foo: 'bar' })\n" +
          '\n' +
          'NestedObject({\n' +
          "  // missing foo: 'bar'\n" +
          '})'
      );
    });

    it('should mark keys unecessary', () => {
      expect(function () {
        clonedExpect(new NestedObject({ foo: 'bar' })).toEqual(
          new NestedObject({})
        );
      }).toThrow(
        "expected NestedObject({ foo: 'bar' }) to equal NestedObject({})\n" +
          '\n' +
          'NestedObject({\n' +
          "  foo: 'bar' // should be removed\n" +
          '})'
      );
    });
  });
});
