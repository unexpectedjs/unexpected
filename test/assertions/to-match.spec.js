/*global expect*/
describe('to match assertion', () => {
  it('tests that the subject matches the given regular expression', () => {
    expect('test', 'to match', /.*st/);
    expect('test', 'not to match', /foo/);
  });

  it('does not keep state between invocations', () => {
    // This tests that the assertion does not depend on the lastIndex
    // property of the regexp:
    const regExp = /a/g;
    const str = 'aa';
    expect(str, 'to match', regExp);
    expect(str, 'to match', regExp);
    expect(str, 'to match', regExp);
  });

  it('throws when the assertion fails', () => {
    expect(
      () => {
        expect('test', 'to match', /foo/);
      },
      'to throw exception',
      "expected 'test' to match /foo/"
    );
  });

  it('should provide the return value of String.prototype.match as the fulfillment value', () => {
    return expect('foo', 'to match', /(f)(o)/).then(captures => {
      expect(captures, 'to satisfy', {
        0: 'fo',
        1: 'f',
        2: 'o',
        input: 'foo',
        index: 0
      });
    });
  });

  it('should provide the captured values and the index as the fulfillment value so that the captures are spreadable', () => {
    return expect('foo', 'to match', /(f)(o)/).spread(($0, $1, $2) => {
      expect($0, 'to equal', 'fo');
      expect($1, 'to equal', 'f');
      expect($2, 'to equal', 'o');
    });
  });

  describe('with a regular expression that has the global flag', () => {
    it('should provide the return value of String.prototype.match as the fulfillment value', () => {
      return expect('abc abc', 'to match', /a(b)c/g).then(captures => {
        expect(captures, 'to equal', ['abc', 'abc']);
      });
    });

    it('should provide the captured values and the index as the fulfillment value so that the matched values are spreadable', () => {
      return expect('abc abc', 'to match', /a(b)c/g).spread(
        (firstMatch, secondMatch) => {
          expect(firstMatch, 'to equal', 'abc');
          expect(secondMatch, 'to equal', 'abc');
        }
      );
    });
  });

  describe('with the not flag', () => {
    it('provides a diff when the assertion fails', () => {
      expect(
        () => {
          expect('barfooquuxfoobaz', 'not to match', /foo/);
        },
        'to throw',
        "expected 'barfooquuxfoobaz' not to match /foo/\n" +
          '\n' +
          'barfooquuxfoobaz\n' +
          '   ^^^    ^^^'
      );
    });

    it('handles newlines in the matched text', () => {
      expect(
        () => {
          expect('barfo\noquuxfoobaz', 'not to match', /fo\no/);
        },
        'to throw',
        "expected 'barfo\\noquuxfoobaz' not to match /fo\\no/\n" +
          '\n' +
          'barfo\n' +
          '   ^^\n' +
          'oquuxfoobaz\n' +
          '^'
      );
    });
  });
});
