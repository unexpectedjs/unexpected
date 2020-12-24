/* global expect */
describe('to have property assertion', () => {
  it('asserts presence of an own property (and value optionally)', () => {
    expect([1, 2]).toHaveProperty('length');
    expect([1, 2]).toHaveProperty('length', 2);
    expect({ a: 'b' }).toHaveProperty('a');
    expect({ a: 'b' }).toHaveProperty('a', 'b');
    expect({ a: 'b' }).toHaveProperty('toString');
    expect({ a: 'b' }).notToHaveProperty('b');
    expect({ '"a"': 'b' }).toHaveOwnProperty('"a"');
    expect(Object.create({ a: 'b' })).notToHaveOwnProperty('a');
    expect(function () {}).toHaveProperty('toString');
  });

  describe('property descriptor', () => {
    const subject = { a: 'b' };
    Object.defineProperty(subject, 'enumFalse', {
      enumerable: false,
      value: 't',
    });
    Object.defineProperty(subject, 'configFalse', {
      configurable: false,
      value: 't',
    });
    Object.defineProperty(subject, 'writableFalse', {
      writable: false,
      value: 't',
    });
    Object.defineProperty(subject, 'enumTrue', {
      enumerable: true,
      value: 't',
    });
    Object.defineProperty(subject, 'configTrue', {
      configurable: true,
      value: 't',
    });
    Object.defineProperty(subject, 'writableTrue', {
      writable: true,
      value: 't',
    });

    it('asserts validity of property descriptor', () => {
      expect(subject).toHaveEnumerableProperty('a');
      expect(subject).toHaveConfigurableProperty('a');
      expect(subject).toHaveWritableProperty('a');
      expect(subject).toHaveUnenumerableProperty('enumFalse');
      expect(subject).toHaveUnconfigurableProperty('configFalse');
      expect(subject).toHaveUnwritableProperty('writableFalse');
      expect(subject).toHaveReadonlyProperty('writableFalse');
    });

    it('throws when assertion fails', () => {
      expect(function () {
        expect(subject).toHaveEnumerableProperty('enumFalse');
      }).toThrowException(
        'expected\n' +
          '{\n' +
          "  a: 'b', enumFalse: 't', configFalse: 't', writableFalse: 't',\n" +
          "  enumTrue: 't', configTrue: 't', writableTrue: 't'\n" +
          '}\n' +
          "to have enumerable property 'enumFalse'"
      );
      expect(function () {
        expect(subject).toHaveUnenumerableProperty('enumTrue');
      }).toThrowException(
        'expected\n' +
          '{\n' +
          "  a: 'b', enumFalse: 't', configFalse: 't', writableFalse: 't',\n" +
          "  enumTrue: 't', configTrue: 't', writableTrue: 't'\n" +
          '}\n' +
          "to have unenumerable property 'enumTrue'"
      );
      expect(function () {
        expect(subject).toHaveConfigurableProperty('configFalse');
      }).toThrowException(
        'expected\n' +
          '{\n' +
          "  a: 'b', enumFalse: 't', configFalse: 't', writableFalse: 't',\n" +
          "  enumTrue: 't', configTrue: 't', writableTrue: 't'\n" +
          '}\n' +
          "to have configurable property 'configFalse'"
      );
      expect(function () {
        expect(subject).toHaveUnconfigurableProperty('configTrue');
      }).toThrowException(
        'expected\n' +
          '{\n' +
          "  a: 'b', enumFalse: 't', configFalse: 't', writableFalse: 't',\n" +
          "  enumTrue: 't', configTrue: 't', writableTrue: 't'\n" +
          '}\n' +
          "to have unconfigurable property 'configTrue'"
      );
      expect(function () {
        expect(subject).toHaveWritableProperty('writableFalse');
      }).toThrowException(
        'expected\n' +
          '{\n' +
          "  a: 'b', enumFalse: 't', configFalse: 't', writableFalse: 't',\n" +
          "  enumTrue: 't', configTrue: 't', writableTrue: 't'\n" +
          '}\n' +
          "to have writable property 'writableFalse'"
      );
      expect(function () {
        expect(subject).toHaveUnwritableProperty('writableTrue');
      }).toThrowException(
        'expected\n' +
          '{\n' +
          "  a: 'b', enumFalse: 't', configFalse: 't', writableFalse: 't',\n" +
          "  enumTrue: 't', configTrue: 't', writableTrue: 't'\n" +
          '}\n' +
          "to have unwritable property 'writableTrue'"
      );
      expect(function () {
        expect(subject).toHaveReadonlyProperty('writableTrue');
      }).toThrowException(
        'expected\n' +
          '{\n' +
          "  a: 'b', enumFalse: 't', configFalse: 't', writableFalse: 't',\n" +
          "  enumTrue: 't', configTrue: 't', writableTrue: 't'\n" +
          '}\n' +
          "to have readonly property 'writableTrue'"
      );
    });

    // Regression test
    it('does not break when the object does not have the given property', function () {
      expect(() => expect({}).toHaveConfigurableProperty('foo')).toThrow(
        "expected {} to have configurable property 'foo'"
      );
    });
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect({ a: 'b' }).toHaveProperty('b');
    }).toThrowException("expected { a: 'b' } to have property 'b'");

    expect(function () {
      expect(null).toHaveProperty('b');
    }).toThrowException(
      "expected null to have property 'b'\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <null> to have property <string>\n' +
        '  did you mean:\n' +
        '    <object> [not] to have property <string|Symbol>\n' +
        '    <object> to have [own] property <string|Symbol> <any>'
    );

    expect(function () {
      expect({ a: 'b' }).toHaveProperty('a', 'c');
    }).toThrowException(
      "expected { a: 'b' } to have property 'a' with a value of 'c'\n" +
        '\n' +
        '-b\n' +
        '+c'
    );

    expect(function () {
      expect({ a: 'b' }).toHaveOwnProperty('a', 'c');
    }).toThrowException(
      "expected { a: 'b' } to have own property 'a' with a value of 'c'\n" +
        '\n' +
        '-b\n' +
        '+c'
    );

    expect(function () {
      // property expectations ignores value if property
      expect(null).notToHaveProperty('a', 'b');
    }).toThrowException(
      "expected null not to have property 'a', 'b'\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <null> not to have property <string> <string>\n' +
        '  did you mean:\n' +
        '    <object> [not] to have property <string|Symbol>'
    );

    expect(function () {
      // property expectations on value expects the property to be present
      expect(null).notToHaveOwnProperty('a', 'b');
    }).toThrowException(
      "expected null not to have own property 'a', 'b'\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <null> not to have own property <string> <string>\n' +
        '  did you mean:\n' +
        '    <object> [not] to have own property <string|Symbol>'
    );
  });

  it('does not support the not-flag in combination with a value argument', () => {
    expect(function () {
      expect({ a: 'a' }).notToHaveProperty('a', 'a');
    }).toThrow(
      "expected { a: 'a' } not to have property 'a', 'a'\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <object> not to have property <string> <string>\n' +
        '  did you mean:\n' +
        '    <object> [not] to have property <string|Symbol>'
    );

    expect(function () {
      expect({ a: 'a' }).notToHaveOwnProperty('a', 'a');
    }).toThrow(
      "expected { a: 'a' } not to have own property 'a', 'a'\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <object> not to have own property <string> <string>\n' +
        '  did you mean:\n' +
        '    <object> [not] to have own property <string|Symbol>'
    );
  });

  describe('with a subtype that overrides valueForKey()', () => {
    const clonedExpect = expect.clone();

    clonedExpect.addType({
      name: 'upperCaseObject',
      base: 'object',
      identify: function (obj) {
        return obj && typeof 'object';
      },
      valueForKey: function (obj, key) {
        if (typeof obj[key] === 'string') {
          return obj[key].toUpperCase();
        }
        return obj[key];
      },
    });

    it('should process the value in "to have property"', () => {
      expect(
        clonedExpect({ foo: 'bAr' }).toHaveProperty('foo')
      ).toBeFulfilledWith('BAR');
    });
  });

  if (
    typeof Symbol === 'function' &&
    Symbol('foo').toString() === 'Symbol(foo)'
  ) {
    describe('with symbols', function () {
      describe('to have property', function () {
        it('should pass when the object contains the symbol', function () {
          const symbol = Symbol('foo');
          expect({ [symbol]: 123 }).toHaveProperty(symbol);
        });

        it('should fail when the object does not contain the symbol', function () {
          const symbol = Symbol('foo');
          expect(() => expect({ bar: 123 }).toHaveProperty(symbol)).toThrow(
            "expected { bar: 123 } to have property Symbol('foo')"
          );
        });
      });

      describe('to have own property', function () {
        it('should pass when the object contains the symbol', function () {
          const symbol = Symbol('foo');
          expect({ [symbol]: 123 }).toHaveOwnProperty(symbol);
        });

        it('should fail when the object does not contain the symbol', function () {
          const symbol = Symbol('foo');
          expect(() => expect({ bar: 123 }).toHaveOwnProperty(symbol)).toThrow(
            "expected { bar: 123 } to have own property Symbol('foo')"
          );
        });

        describe('with expected value', function () {
          it('should pass when the object contains the symbol with the given value', function () {
            const symbol = Symbol('foo');
            expect({ [symbol]: 123 }).toHaveOwnProperty(symbol, 123);
          });

          it('should fail when the object does not contain the symbol', function () {
            const symbol = Symbol('foo');
            expect(() =>
              expect({ bar: 123 }).toHaveOwnProperty(symbol, 123)
            ).toThrow(
              "expected { bar: 123 } to have own property Symbol('foo'), 123"
            );
          });

          it('should fail when the object contains the symbol, but with a different value', function () {
            const symbol = Symbol('foo');
            expect(() =>
              expect({ [symbol]: 456 }).toHaveOwnProperty(symbol, 123)
            ).toThrow(
              "expected { [Symbol('foo')]: 456 }\n" +
                "to have own property Symbol('foo') with a value of 123"
            );
          });
        });
      });

      describe('to have enumerable(/configurable/writable) property', function () {
        it('should pass when the object contains the symbol', function () {
          const symbol = Symbol('foo');
          expect({ [symbol]: 123 }).toHaveEnumerableProperty(symbol);
        });

        it('should fail when the object does not contain the symbol', function () {
          const symbol = Symbol('foo');
          expect(() =>
            expect({ bar: 123 }).toHaveEnumerableProperty(symbol)
          ).toThrow(
            "expected { bar: 123 } to have enumerable property Symbol('foo')"
          );
        });
      });
    });
  }
});
