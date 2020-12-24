/* global expect */
describe('to be a/an assertion', () => {
  const circular = {};
  circular.self = circular;

  it('asserts typeof with support for array type and instanceof', () => {
    expect(5).toBeA('number');
    expect(5).toBeANumber();
    expect('abc').toBeA('string');
    expect('').toBeAString();
    expect('').toBeTheEmptyString();
    expect('').toBeAnEmptyString();
    expect('abc').toBeANonEmptyString();
    expect([]).toBeAn('array');
    expect([]).toBeAnArray();
    expect([]).toBeAnEmptyArray();
    expect({}).toBeAn(Object);
    expect([123]).toBeANonEmptyArray();
    expect([]).toBeAn('object');
    expect([]).toBeAnObject();
    expect([]).toBeAn(Array);
    expect(/ab/).toBeA(RegExp);
    expect(/ab/).toBeARegexp();
    expect(123).notToBeARegex();
    expect(/ab/).toBeARegex();
    expect(/ab/).toBeARegularExpression();
    expect(123).notToBeARegularExpression();
    expect(null).notToBeAn('object');
    expect(null).notToBeAnObject();
    expect(true).toBeA('boolean');
    expect(true).toBeABoolean();
    expect(expect).toBeA('function');
    expect(expect).toBeAFunction();
    expect(circular).toBeAnObject();
    expect(new Date()).toBeA('date');
    expect(new Date()).toBeADate();
    expect({}).notToBeADate();
    expect(new Date().toISOString()).notToBeADate();
  });

  it('should support type objects', () => {
    expect('foo').toBeA(expect.getType('string'));
  });

  describe('with a type name', () => {
    it('should succeed when the subject is recognized as having the type', () => {
      expect(new Error('foo')).toBeAn('Error');
    });

    it('should fail when the subject is not recognized as having the type', () => {
      expect(function () {
        expect(123).toBeAn('Error');
      }).toThrow('expected 123 to be an Error');
    });

    // Maybe better: throw a non-Unexpected error
    it('should fail when the type is not defined', () => {
      expect(function () {
        expect(123).toBeA('FoopQuuxDoop');
      }).toThrow(
        'expected 123 to be a FoopQuuxDoop\n' + '  Unknown type: FoopQuuxDoop'
      );
    });

    it('should fail when the type is not defined in the "not" case', () => {
      expect(function () {
        expect(123).notToBeA('FoopQuuxDoop');
      }).toThrow(
        'expected 123 not to be a FoopQuuxDoop\n' +
          '  Unknown type: FoopQuuxDoop'
      );
    });
  });

  it('formats Error instances correctly when an assertion fails', () => {
    expect(function () {
      const error = new Error('error message');
      error.data = 'extra';
      expect(error).toBeANumber();
    }).toThrow(
      "expected Error({ message: 'error message', data: 'extra' }) to be a number"
    );
  });

  it('should fail with the correct error message if the type is given as an anonymous function', () => {
    expect(function () {
      expect('foo').toBeA(function () {});
    }).toThrow("expected 'foo' to be a function () {}");
  });

  it('should throw when the type is specified as undefined', () => {
    expect(function () {
      expect('foo').toBeAn(undefined);
    }).toThrow(
      "expected 'foo' to be an undefined\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <string> to be an <undefined>\n' +
        '  did you mean:\n' +
        '    <any> [not] to be (a|an) <function>\n' +
        '    <any> [not] to be (a|an) <string>\n' +
        '    <any> [not] to be (a|an) <type>'
    );
  });

  it('should throw when the type is specified as null', () => {
    expect(function () {
      expect('foo').toBeA(null);
    }).toThrow(
      "expected 'foo' to be a null\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <string> to be a <null>\n' +
        '  did you mean:\n' +
        '    <any> [not] to be (a|an) <function>\n' +
        '    <any> [not] to be (a|an) <string>\n' +
        '    <any> [not] to be (a|an) <type>'
    );
  });

  it('should not consider a string a to be an instance of an object without a name property', () => {
    expect(function () {
      expect('foo').toBeA({});
    }).toThrow(
      "expected 'foo' to be a {}\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <string> to be a <object>\n' +
        '  did you mean:\n' +
        '    <any> [not] to be (a|an) <function>\n' +
        '    <any> [not] to be (a|an) <string>\n' +
        '    <any> [not] to be (a|an) <type>'
    );
  });

  it('should throw when the type is specified as an object without an identify function', () => {
    expect(function () {
      expect('foo').toBeA({ name: 'bar' });
    }).toThrow(
      "expected 'foo' to be a { name: 'bar' }\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <string> to be a <object>\n' +
        '  did you mean:\n' +
        '    <any> [not] to be (a|an) <function>\n' +
        '    <any> [not] to be (a|an) <string>\n' +
        '    <any> [not] to be (a|an) <type>'
    );
  });

  it('should throw when the type is specified as an object with an identify function, but without a name property', () => {
    expect(function () {
      expect('foo').toBeA({
        // prettier-ignore
        identify: function () {
            return true;
          },
      });
    }).toThrow(
      expect.it(function (err) {
        // Compensate for V8 5.1+ setting { identify: function () {} }.identify.name === 'identify'
        // http://v8project.blogspot.dk/2016/04/v8-release-51.html
        expect(
          err
            .getErrorMessage('text')
            .toString()
            .replace('function identify', 'function ')
        ).toSatisfy(
          "expected 'foo' to be a { identify: function () { return true; } }\n" +
            '  The assertion does not have a matching signature for:\n' +
            '    <string> to be a <object>\n' +
            '  did you mean:\n' +
            '    <any> [not] to be (a|an) <function>\n' +
            '    <any> [not] to be (a|an) <string>\n' +
            '    <any> [not] to be (a|an) <type>'
        );
      })
    );
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect(5).toBeAn(Array);
    }).toThrowException('expected 5 to be an Array');

    expect(function () {
      expect([]).notToBeAn('array');
    }).toThrowException('expected [] not to be an array');

    expect(function () {
      expect(circular).notToBeAnObject();
    }).toThrowException('expected { self: [Circular] } not to be an object');
  });

  it('throws an error a diff when comparing string and not negated', () => {
    expect(function () {
      expect('foo').toBe('bar');
    }).toThrowException(
      "expected 'foo' to be 'bar'\n" + '\n' + '-foo\n' + '+bar'
    );
  });

  it('throws an error without actual and expected when comparing string and negated', () => {
    expect(function () {
      expect('foo').notToBe('foo');
    }).toThrowException(
      expect.it(function (e) {
        expect(e).notToHaveProperty('actual');
        expect(e).notToHaveProperty('expected');
      })
    );
  });

  it('throws an error without actual and expected when not comparing string and not negated', () => {
    expect(function () {
      expect('foo').toBe({});
    }).toThrowException(
      expect.it(function (e) {
        expect(e).notToHaveProperty('actual');
        expect(e).notToHaveProperty('expected');
      })
    );
  });
});
