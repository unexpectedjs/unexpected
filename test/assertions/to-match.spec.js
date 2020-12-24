/* global expect */
describe('to match assertion', () => {
  it('tests that the subject matches the given regular expression', () => {
    expect('test').toMatch(/.*st/);
    expect('test').notToMatch(/foo/);
  });

  it('does not keep state between invocations', () => {
    // This tests that the assertion does not depend on the lastIndex
    // property of the regexp:
    const regExp = /a/g;
    const str = 'aa';
    expect(str).toMatch(regExp);
    expect(str).toMatch(regExp);
    expect(str).toMatch(regExp);
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect('test').toMatch(/foo/);
    }).toThrowException("expected 'test' to match /foo/");
  });

  it('should provide the return value of String.prototype.match as the fulfillment value', () => {
    return expect('foo')
      .toMatch(/(f)(o)/)
      .then(function (captures) {
        expect(captures).toSatisfy({
          0: 'fo',
          1: 'f',
          2: 'o',
          input: 'foo',
          index: 0,
        });
      });
  });

  it('should provide the captured values and the index as the fulfillment value so that the captures are spreadable', () => {
    return expect('foo')
      .toMatch(/(f)(o)/)
      .spread(function ($0, $1, $2) {
        expect($0).toEqual('fo');
        expect($1).toEqual('f');
        expect($2).toEqual('o');
      });
  });

  describe('with a regular expression that has the global flag', () => {
    it('should provide the return value of String.prototype.match as the fulfillment value', () => {
      return expect('abc abc')
        .toMatch(/a(b)c/g)
        .then(function (captures) {
          expect(captures).toEqual(['abc', 'abc']);
        });
    });

    it('should provide the captured values and the index as the fulfillment value so that the matched values are spreadable', () => {
      return expect('abc abc')
        .toMatch(/a(b)c/g)
        .spread(function (firstMatch, secondMatch) {
          expect(firstMatch).toEqual('abc');
          expect(secondMatch).toEqual('abc');
        });
    });
  });

  describe('with the not flag', () => {
    it('provides a diff when the assertion fails', () => {
      expect(function () {
        expect('barfooquuxfoobaz').notToMatch(/foo/);
      }).toThrow(
        "expected 'barfooquuxfoobaz' not to match /foo/\n" +
          '\n' +
          'barfooquuxfoobaz\n' +
          '   ^^^    ^^^'
      );
    });

    it('handles newlines in the matched text', () => {
      expect(function () {
        expect('barfo\noquuxfoobaz').notToMatch(/fo\no/);
      }).toThrow(
        "expected 'barfo\\noquuxfoobaz' not to match /fo\\no/\n" +
          '\n' +
          'barfo\\n\n' +
          '   ^^^\n' +
          'oquuxfoobaz\n' +
          '^'
      );
    });

    it('highlights a newline at the end of the match', function () {
      expect(function () {
        expect('foobar\n').notToMatch(/\s+/);
      }).toThrow(
        "expected 'foobar\\n' not to match /\\s+/\n" +
          '\n' +
          'foobar\\n\n' +
          '      ^\n' +
          '\n'
      );
    });
  });
});
