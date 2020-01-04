/* global expect */
describe('to have properties satisfying assertion', () => {
  it('requires a third argument', () => {
    expect(
      function() {
        expect([1, 2, 3], 'to have properties satisfying');
      },
      'to throw',
      'expected [ 1, 2, 3 ] to have properties satisfying\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <array> to have properties satisfying\n' +
        '  did you mean:\n' +
        '    <object> to have properties satisfying <any>\n' +
        '    <object> to have properties satisfying <assertion>'
    );
  });

  it('does not accept a fourth argument', () => {
    expect(
      function() {
        expect([1], 'to have properties satisfying', 0, 1);
      },
      'to throw',
      'expected [ 1 ] to have properties satisfying 0, 1\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <array> to have properties satisfying <number> <number>\n' +
        '  did you mean:\n' +
        '    <object> to have properties satisfying <any>\n' +
        '    <object> to have properties satisfying <assertion>'
    );
  });

  it('only accepts objects as the target', () => {
    expect(
      function() {
        expect(42, 'to have properties satisfying', true);
      },
      'to throw',
      'expected 42 to have properties satisfying true\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <number> to have properties satisfying <boolean>\n' +
        '  did you mean:\n' +
        '    <object> to have properties satisfying <any>\n' +
        '    <object> to have properties satisfying <assertion>'
    );
  });

  it('does not throw for any keys in the map with an expect.it-wrapped function', () => {
    expect(
      { foo: 0, bar: 1, baz: 2, qux: 3 },
      'to have properties satisfying',
      expect.it(function(key) {
        expect(key, 'not to be empty');
      })
    );

    expect(
      { foo: 0, bar: 1, baz: 2, qux: 3 },
      'to have properties satisfying',
      expect.it(function(key) {
        expect(key, 'to match', /^[a-z]{3}$/);
      })
    );

    expect(
      { foo: 0, bar: 1, baz: 2, qux: 3 },
      'to have properties satisfying',
      'not to be empty'
    );

    expect(
      { foo: 0, bar: 1, baz: 2, qux: 3 },
      'to have properties satisfying',
      'to match',
      /^[a-z]{3}$/
    );
  });

  it('receives the key when the third argument is an expect.it-wrapped function', () => {
    expect(
      { foo: 123 },
      'to have properties satisfying',
      expect.it(function(key) {
        expect(key, 'to equal', 'foo');
      })
    );
  });

  it('ignores undefined keys', () => {
    expect(
      { foo: undefined, bar: '123' },
      'to have properties satisfying',
      expect.it('to be a string')
    );
  });

  it('uses value semantics for functions', () => {
    expect(
      function() {
        expect(
          {
            foo: true
          },
          'to have properties satisfying',
          function(key) {
            throw new Error('should not be called');
          }
        );
      },
      'to throw',
      'expected { foo: true } to have properties satisfying\n' +
        'function (key) {\n' +
        "  throw new Error('should not be called');\n" +
        '}\n' +
        '\n' +
        '[\n' +
        "  'foo' // should equal function (key) {\n" +
        "        //                throw new Error('should not be called');\n" +
        '        //              }\n' +
        ']'
    );
  });

  it('fails for an empty array', () => {
    expect(
      function() {
        expect([], 'to have properties satisfying', 123);
      },
      'to throw',
      'expected [] to have properties satisfying 123\n' +
        '  expected [] not to be empty'
    );
  });

  it('should work with non-enumerable keys returned by the getKeys function of the subject type', () => {
    expect(
      function() {
        expect(new Error('foo'), 'to have properties satisfying', /bar/);
      },
      'to throw',
      "expected Error('foo') to have properties satisfying /bar/\n" +
        '\n' +
        '[\n' +
        "  'message' // should match /bar/\n" +
        ']'
    );
  });

  it('fails when the assertion fails', () => {
    expect(
      function() {
        expect(
          { foo: 0, bar: 1, Baz: 2, qux: 3 },
          'to have properties satisfying',
          'to match',
          /^[a-z]{3}$/
        );
      },
      'to throw',
      /'Baz', \/\/ should match/
    );
  });

  it('provides a detailed report of where failures occur', () => {
    expect(
      function() {
        expect(
          { foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 },
          'to have properties satisfying',
          expect.it(function(key) {
            expect(key, 'to have length', 3);
          })
        );
      },
      'to throw',
      'expected { foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 } to have properties satisfying\n' +
        'expect.it(function (key) {\n' +
        "  expect(key, 'to have length', 3);\n" +
        '})\n' +
        '\n' +
        '[\n' +
        "  'foo',\n" +
        "  'bar',\n" +
        "  'baz',\n" +
        "  'qux',\n" +
        "  'quux' // should have length 3\n" +
        '         //   expected 4 to be 3\n' +
        ']'
    );
  });

  describe('delegating to an async assertion', () => {
    var clonedExpect = expect
      .clone()
      .addAssertion(
        '<any> to be a sequence of as after a short delay',
        function(expect, subject) {
          expect.errorMode = 'nested';

          return expect.promise(function(run) {
            setTimeout(
              run(function() {
                expect(subject, 'to match', /^a+$/);
              }),
              1
            );
          });
        }
      );

    it('should succeed', () => {
      return clonedExpect(
        { a: 1, aa: 2 },
        'to have properties satisfying',
        'to be a sequence of as after a short delay'
      );
    });

    it('should fail with a diff', () => {
      return expect(
        clonedExpect(
          { a: 1, foo: 2, bar: 3 },
          'to have properties satisfying',
          'to be a sequence of as after a short delay'
        ),
        'to be rejected with',
        'expected { a: 1, foo: 2, bar: 3 }\n' +
          'to have properties satisfying to be a sequence of as after a short delay\n' +
          '\n' +
          '[\n' +
          "  'a',\n" +
          "  'foo', // should be a sequence of as after a short delay\n" +
          '         //   should match /^a+$/\n' +
          "  'bar' // should be a sequence of as after a short delay\n" +
          '        //   should match /^a+$/\n' +
          ']'
      );
    });
  });
});
