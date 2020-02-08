/* global expect */
describe('to have property assertion', () => {
  it('asserts presence of an own property (and value optionally)', () => {
    expect([1, 2], 'to have property', 'length');
    expect([1, 2], 'to have property', 'length', 2);
    expect({ a: 'b' }, 'to have property', 'a');
    expect({ a: 'b' }, 'to have property', 'a', 'b');
    expect({ a: 'b' }, 'to have property', 'toString');
    expect({ a: 'b' }, 'not to have property', 'b');
    expect({ '"a"': 'b' }, 'to have own property', '"a"');
    expect(Object.create({ a: 'b' }), 'not to have own property', 'a');
    expect(function() {}, 'to have property', 'toString');
  });

  describe('property descriptor', () => {
    var subject = { a: 'b' };
    Object.defineProperty(subject, 'enumFalse', {
      enumerable: false,
      value: 't'
    });
    Object.defineProperty(subject, 'configFalse', {
      configurable: false,
      value: 't'
    });
    Object.defineProperty(subject, 'writableFalse', {
      writable: false,
      value: 't'
    });

    it('asserts validity of property descriptor', () => {
      expect(subject, 'to have enumerable property', 'a');
      expect(subject, 'to have configurable property', 'a');
      expect(subject, 'to have writable property', 'a');
    });

    it('throws when assertion fails', () => {
      expect(
        function() {
          expect(subject, 'to have enumerable property', 'enumFalse');
        },
        'to throw exception',
        "expected { a: 'b', enumFalse: 't', configFalse: 't', writableFalse: 't' }\n" +
          "to have enumerable property 'enumFalse'"
      );
      expect(
        function() {
          expect(subject, 'to have configurable property', 'configFalse');
        },
        'to throw exception',
        "expected { a: 'b', enumFalse: 't', configFalse: 't', writableFalse: 't' }\n" +
          "to have configurable property 'configFalse'"
      );
      expect(
        function() {
          expect(subject, 'to have writable property', 'writableFalse');
        },
        'to throw exception',
        "expected { a: 'b', enumFalse: 't', configFalse: 't', writableFalse: 't' }\n" +
          "to have writable property 'writableFalse'"
      );
    });

    // Regression test
    it('does not break when the object does not have the given property', function() {
      expect(
        () => expect({}, 'to have configurable property', 'foo'),
        'to throw',
        "expected {} to have configurable property 'foo'"
      );
    });
  });

  it('throws when the assertion fails', () => {
    expect(
      function() {
        expect({ a: 'b' }, 'to have property', 'b');
      },
      'to throw exception',
      "expected { a: 'b' } to have property 'b'"
    );

    expect(
      function() {
        expect(null, 'to have property', 'b');
      },
      'to throw exception',
      "expected null to have property 'b'\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <null> to have property <string>\n' +
        '  did you mean:\n' +
        '    <object> [not] to have property <string|Symbol>\n' +
        '    <object> to have [own] property <string> <any>'
    );

    expect(
      function() {
        expect({ a: 'b' }, 'to have property', 'a', 'c');
      },
      'to throw exception',
      "expected { a: 'b' } to have property 'a' with a value of 'c'\n" +
        '\n' +
        '-b\n' +
        '+c'
    );

    expect(
      function() {
        expect({ a: 'b' }, 'to have own property', 'a', 'c');
      },
      'to throw exception',
      "expected { a: 'b' } to have own property 'a' with a value of 'c'\n" +
        '\n' +
        '-b\n' +
        '+c'
    );

    expect(
      function() {
        // property expectations ignores value if property
        expect(null, 'not to have property', 'a', 'b');
      },
      'to throw exception',
      "expected null not to have property 'a', 'b'\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <null> not to have property <string> <string>\n' +
        '  did you mean:\n' +
        '    <object> [not] to have property <string|Symbol>'
    );

    expect(
      function() {
        // property expectations on value expects the property to be present
        expect(null, 'not to have own property', 'a', 'b');
      },
      'to throw exception',
      "expected null not to have own property 'a', 'b'\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <null> not to have own property <string> <string>\n' +
        '  did you mean:\n' +
        '    <object> [not] to have own property <string>'
    );
  });

  it('does not support the not-flag in combination with a value argument', () => {
    expect(
      function() {
        expect({ a: 'a' }, 'not to have property', 'a', 'a');
      },
      'to throw',
      "expected { a: 'a' } not to have property 'a', 'a'\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <object> not to have property <string> <string>\n' +
        '  did you mean:\n' +
        '    <object> [not] to have property <string|Symbol>'
    );

    expect(
      function() {
        expect({ a: 'a' }, 'not to have own property', 'a', 'a');
      },
      'to throw',
      "expected { a: 'a' } not to have own property 'a', 'a'\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <object> not to have own property <string> <string>\n' +
        '  did you mean:\n' +
        '    <object> [not] to have own property <string>'
    );
  });

  describe('with a subtype that overrides valueForKey()', () => {
    var clonedExpect = expect.clone();

    clonedExpect.addType({
      name: 'upperCaseObject',
      base: 'object',
      identify: function(obj) {
        return obj && typeof 'object';
      },
      valueForKey: function(obj, key) {
        if (typeof obj[key] === 'string') {
          return obj[key].toUpperCase();
        }
        return obj[key];
      }
    });

    it('should process the value in "to have property"', () => {
      expect(
        clonedExpect({ foo: 'bAr' }, 'to have property', 'foo'),
        'to be fulfilled with',
        'BAR'
      );
    });
  });

  if (typeof Symbol === 'function') {
    describe('with symbols', function() {
      it('should pass when the object contains the symbol', function() {
        const symbol = Symbol('foo');
        expect({ [symbol]: 123 }, 'to have property', symbol);
      });

      it('should fail when the object does not contain the symbol', function() {
        const symbol = Symbol('foo');
        expect(
          () => expect({ bar: 123 }, 'to have property', symbol),
          'to throw',
          "expected { bar: 123 } to have property Symbol('foo')"
        );
      });
    });
  }
});
