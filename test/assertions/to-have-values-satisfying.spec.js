/* global expect */
describe('to have values satisfying assertion', () => {
  it('requires a third argument', () => {
    expect(
      function () {
        expect([1, 2, 3], 'to have values satisfying');
      },
      'to throw',
      'expected [ 1, 2, 3 ] to have values satisfying\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <array> to have values satisfying\n' +
        '  did you mean:\n' +
        '    <object> to have values [exhaustively] satisfying <any>\n' +
        '    <object> to have values [exhaustively] satisfying <assertion>'
    );
  });

  it('does not accept a fourth argument', () => {
    expect(
      function () {
        expect([1], 'to have values satisfying', 1, 2);
      },
      'to throw',
      'expected [ 1 ] to have values satisfying 1, 2\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <array> to have values satisfying <number> <number>\n' +
        '  did you mean:\n' +
        '    <object> to have values [exhaustively] satisfying <any>\n' +
        '    <object> to have values [exhaustively] satisfying <assertion>'
    );
  });

  it('only accepts objects and arrays as the target', () => {
    expect(
      function () {
        expect(
          42,
          'to have values satisfying',
          expect.it(function (value) {})
        );
      },
      'to throw',
      'expected 42 to have values satisfying expect.it(function (value) {})\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <number> to have values satisfying <expect.it>\n' +
        '  did you mean:\n' +
        '    <object> to have values [exhaustively] satisfying <any>\n' +
        '    <object> to have values [exhaustively] satisfying <assertion>'
    );
  });

  it('asserts that the given callback does not throw for any values in the map', () => {
    expect(
      { foo: 0, bar: 1, baz: 2, qux: 3 },
      'to have values satisfying',
      expect.it(function (value) {
        expect(value, 'to be a number');
      })
    );

    expect(
      { foo: '0', bar: '1', baz: '2', qux: '3' },
      'to have values satisfying',
      expect.it(function (value) {
        expect(value, 'not to be a number');
      })
    );

    expect(
      { foo: 0, bar: 1, baz: 2, qux: 3 },
      'to have values satisfying',
      'to be a number'
    );

    expect(
      { foo: '0', bar: '1', baz: '2', qux: '3' },
      'to have values satisfying',
      'not to be a number'
    );
  });

  it('fails if the given object is empty', () => {
    expect(
      function () {
        expect(
          {},
          'to have values satisfying',
          expect.it(function (value) {
            expect(value, 'to equal', '0');
          })
        );
      },
      'to throw',
      'expected {} to have values satisfying\n' +
        'expect.it(function (value) {\n' +
        "  expect(value, 'to equal', '0');\n" +
        '})\n' +
        '  expected {} not to be empty'
    );
  });

  it('fails for an empty array', () => {
    expect(
      function () {
        expect([], 'to have values satisfying', 123);
      },
      'to throw',
      'expected [] to have values satisfying 123\n' +
        '  expected [] not to be empty'
    );
  });

  it('fails if the given array is empty', () => {
    expect(
      function () {
        expect([], 'to have items satisfying', function (item) {
          expect(item, 'to be a number');
        });
      },
      'to throw',
      'expected [] to have items satisfying\n' +
        'function (item) {\n' +
        "  expect(item, 'to be a number');\n" +
        '}\n' +
        '  expected [] not to be empty'
    );
  });

  it('supports legacy aliases', () => {
    expect(
      { foo: '0' },
      'to be a map whose values satisfy',
      'not to be a number'
    );

    expect(
      { foo: '0' },
      'to be an object whose values satisfy',
      'not to be a number'
    );

    expect(
      { foo: '0' },
      'to be a hash whose values satisfy',
      'not to be a number'
    );
  });

  it('fails when the assertion fails', () => {
    expect(
      function () {
        expect(
          { foo: '0', bar: 1, baz: '2', qux: '3' },
          'to have values satisfying',
          expect.it(function (value) {
            expect(value, 'not to be a number');
          })
        );
      },
      'to throw',
      /bar: 1, \/\/ should not be a number/
    );
  });

  it('provides a detailed report of where failures occur', () => {
    expect(
      function () {
        expect(
          { foo: 0, bar: 1, baz: '2', qux: 3, quux: 4 },
          'to have values satisfying',
          expect.it(function (value) {
            expect(value, 'to be a number');
            expect(value, 'to be less than', 4);
          })
        );
      },
      'to throw',
      'expected object to have values satisfying\n' +
        'expect.it(function (value) {\n' +
        "  expect(value, 'to be a number');\n" +
        "  expect(value, 'to be less than', 4);\n" +
        '})\n' +
        '\n' +
        '{\n' +
        '  foo: 0,\n' +
        '  bar: 1,\n' +
        "  baz: '2', // should be a number\n" +
        '  qux: 3,\n' +
        '  quux: 4 // should be less than 4\n' +
        '}'
    );
  });

  it('indents failure reports of nested assertions correctly', () => {
    expect(
      function () {
        expect(
          { foo: [0, 1, 2], bar: [4, '5', 6], baz: [7, 8, '9'] },
          'to have values satisfying',
          // prettier-ignore
          expect.it(function (arr) {
            expect(arr, 'to have items satisfying', expect.it(function (item) {
              expect(item, 'to be a number');
            }));
          })
        );
      },
      'to throw',
      'expected object to have values satisfying\n' +
        'expect.it(function (arr) {\n' +
        "  expect(arr, 'to have items satisfying', expect.it(function (item) {\n" +
        "    expect(item, 'to be a number');\n" +
        '  }));\n' +
        '})\n' +
        '\n' +
        '{\n' +
        '  foo: [ 0, 1, 2 ],\n' +
        '  bar: [\n' +
        '    4,\n' +
        "    '5', // should be a number\n" +
        '    6\n' +
        '  ],\n' +
        '  baz: [\n' +
        '    7,\n' +
        '    8,\n' +
        "    '9' // should be a number\n" +
        '  ]\n' +
        '}'
    );
  });

  describe('delegating to an async assertion', () => {
    var clonedExpect = expect
      .clone()
      .addAssertion('<any> to be a number after a short delay', function (
        expect,
        subject
      ) {
        expect.errorMode = 'nested';

        return expect.promise(function (run) {
          setTimeout(
            run(function () {
              expect(subject, 'to be a number');
            }),
            1
          );
        });
      });

    it('should succeed', () => {
      return clonedExpect(
        { 0: 1, 1: 2, 2: 3 },
        'to have values satisfying',
        'to be a number after a short delay'
      );
    });

    it('should fail with a diff', () => {
      return expect(
        clonedExpect(
          { 0: 0, 1: false, 2: 'abc' },
          'to have values satisfying',
          'to be a number after a short delay'
        ),
        'to be rejected with',
        "expected { 0: 0, 1: false, 2: 'abc' }\n" +
          'to have values satisfying to be a number after a short delay\n' +
          '\n' +
          '{\n' +
          '  0: 0,\n' +
          '  1: false, // should be a number after a short delay\n' +
          '            //   should be a number\n' +
          "  2: 'abc' // should be a number after a short delay\n" +
          '           //   should be a number\n' +
          '}'
      );
    });
  });

  describe('with the exhaustively flag', () => {
    it('should succeed', () => {
      expect(
        [{ foo: 'bar', quux: 'baz' }],
        'to have values exhaustively satisfying',
        { foo: 'bar', quux: 'baz' }
      );
    });

    it('should fail when the spec is not met only because of the "exhaustively" semantics', () => {
      expect(
        function () {
          expect(
            [{ foo: 'bar', quux: 'baz' }],
            'to have values exhaustively satisfying',
            { foo: 'bar' }
          );
        },
        'to throw',
        "expected [ { foo: 'bar', quux: 'baz' } ]\n" +
          "to have values exhaustively satisfying { foo: 'bar' }\n" +
          '\n' +
          '[\n' +
          '  {\n' +
          "    foo: 'bar',\n" +
          "    quux: 'baz' // should be removed\n" +
          '  }\n' +
          ']'
      );
    });
  });

  describe('when passed a function', function () {
    function foo() {}

    it('succeeds when the subject is an array with only that function as items', function () {
      expect([foo, foo], 'to have values satisfying', foo);
    });

    it('fails when the array contains other items', function () {
      expect(
        function () {
          expect([123, 456], 'to have values satisfying', foo);
        },
        'to throw',
        'expected [ 123, 456 ] to have values satisfying function foo() {}\n' +
          '\n' +
          '[\n' +
          '  123, // should equal function foo() {}\n' +
          '  456 // should equal function foo() {}\n' +
          ']'
      );
    });
  });
});
