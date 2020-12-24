/* global expect */
describe('to have keys satisfying assertion', () => {
  it('requires a third argument', () => {
    expect(function () {
      expect([1, 2, 3]).toHaveKeysSatisfying();
    }).toThrow(
      'expected [ 1, 2, 3 ] to have keys satisfying\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <array> to have keys satisfying\n' +
        '  did you mean:\n' +
        '    <object> to have keys satisfying <any>\n' +
        '    <object> to have keys satisfying <assertion>'
    );
  });

  it('does not accept a fourth argument', () => {
    expect(function () {
      expect([1]).toHaveKeysSatisfying(0, 1);
    }).toThrow(
      'expected [ 1 ] to have keys satisfying 0, 1\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <array> to have keys satisfying <number> <number>\n' +
        '  did you mean:\n' +
        '    <object> to have keys satisfying <any>\n' +
        '    <object> to have keys satisfying <assertion>'
    );
  });

  it('only accepts objects as the target', () => {
    expect(function () {
      expect(42).toHaveKeysSatisfying(true);
    }).toThrow(
      'expected 42 to have keys satisfying true\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <number> to have keys satisfying <boolean>\n' +
        '  did you mean:\n' +
        '    <object> to have keys satisfying <any>\n' +
        '    <object> to have keys satisfying <assertion>'
    );
  });

  it('asserts that the given expect.it-wrapped callback does not throw for any keys in the map', () => {
    expect({ foo: 0, bar: 1, baz: 2, qux: 3 }).toHaveKeysSatisfying(
      expect.it(function (key) {
        expect(key).notToBeEmpty();
      })
    );

    expect({ foo: 0, bar: 1, baz: 2, qux: 3 }).toHaveKeysSatisfying(
      expect.it(function (key) {
        expect(key).toMatch(/^[a-z]{3}$/);
      })
    );

    expect({ foo: 0, bar: 1, baz: 2, qux: 3 })
      .toHaveKeysSatisfying()
      .notToBeEmpty();

    expect({ foo: 0, bar: 1, baz: 2, qux: 3 })
      .toHaveKeysSatisfying()
      .toMatch(/^[a-z]{3}$/);
  });

  it('receives the key when the third argument is an expect.it-wrapped function', () => {
    expect({ foo: 123 }).toHaveKeysSatisfying(
      expect.it(function (key) {
        expect(key).toEqual('foo');
      })
    );
  });

  it('fails if the given object is empty', () => {
    expect(function () {
      expect({}).toHaveKeysSatisfying(function (key) {
        expect(key).toMatch(/^[a-z]{3}$/);
      });
    }).toThrow(
      'expected {} to have keys satisfying\n' +
        'function (key) {\n' +
        "  expect(key, 'to match', /^[a-z]{3}$/);\n" +
        '}\n' +
        '  expected {} not to be empty'
    );
  });

  it('fails for an empty array', () => {
    expect(function () {
      expect([]).toHaveKeysSatisfying(123);
    }).toThrow(
      'expected [] to have keys satisfying 123\n' +
        '  expected [] not to be empty'
    );
  });

  it('should work with non-enumerable keys returned by the getKeys function of the subject type', () => {
    expect(function () {
      expect(new Error('foo')).toHaveKeysSatisfying(/bar/);
    }).toThrow(
      "expected Error('foo') to have keys satisfying /bar/\n" +
        '\n' +
        '[\n' +
        "  'message' // should match /bar/\n" +
        ']'
    );
  });

  it('supports legacy aliases', () => {
    expect({ foo: '0' })
      .toBeAMapWhoseKeysSatisfy()
      .toMatch(/^[a-z]{3}$/);

    expect({ foo: '0' })
      .toBeAnObjectWhoseKeysSatisfy()
      .toMatch(/^[a-z]{3}$/);

    expect({ foo: '0' })
      .toBeAHashWhoseKeysSatisfy()
      .toMatch(/^[a-z]{3}$/);
  });

  it('fails when the assertion fails', () => {
    expect(function () {
      expect({ foo: 0, bar: 1, Baz: 2, qux: 3 })
        .toHaveKeysSatisfying()
        .toMatch(/^[a-z]{3}$/);
    }).toThrow(/'Baz', \/\/ should match/);
  });

  it('provides a detailed report of where failures occur', () => {
    expect(function () {
      expect({ foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 }).toHaveKeysSatisfying(
        expect.it(function (key) {
          expect(key).toHaveLength(3);
        })
      );
    }).toThrow(
      'expected { foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 } to have keys satisfying\n' +
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
    const clonedExpect = expect
      .clone()
      .addAssertion(
        '<any> to be a sequence of as after a short delay',
        function (expect, subject) {
          expect.errorMode = 'nested';

          return expect.promise(function (run) {
            setTimeout(
              run(function () {
                expect(subject).toMatch(/^a+$/);
              }),
              1
            );
          });
        }
      );

    it('should succeed', () => {
      return clonedExpect({ a: 1, aa: 2 }).toHaveKeysSatisfying(
        'to be a sequence of as after a short delay'
      );
    });

    it('should fail with a diff', () => {
      return expect(
        clonedExpect({ a: 1, foo: 2, bar: 3 }).toHaveKeysSatisfying(
          'to be a sequence of as after a short delay'
        )
      ).toBeRejectedWith(
        'expected { a: 1, foo: 2, bar: 3 }\n' +
          'to have keys satisfying to be a sequence of as after a short delay\n' +
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
